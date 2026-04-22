<script setup lang="ts">
const { year, handleMilestoneOpened, handleMilestoneClosed } = useYear();

const { assetPrefix, detailsHandler } = defineProps<{
	assetPrefix?: string;
	detailsHandler?: (milestoneId: string) => void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const mapWrapper = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const mapInstance = ref<any>(null);
const markersLayer = ref<any>(null);
const markersMap = ref<Map<string, any>>(new Map()); // Store markers by milestone ID
let isUnmounted = false; // Track if component is unmounted
let pendingMilestoneId: string | null = null; // Store milestone ID to open after map init

// Get milestones with positions for current year
const milestonesWithPosition = computed(() =>
	Object.entries(MILESTONES)
		.filter(([, m]) => m.year == year.value && m.position)
		.map(([id, m]) => ({ ...m, id }) as MilestoneWithId),
);

// Default map center and zoom (can be overridden via config)
// center format: "lat, lng" e.g. "47.4979, 19.0402"
const DEFAULT_CENTER: [number, number] = (() => {
	if (CONFIG.map?.center) {
		const [lat, lng] = CONFIG.map.center.split(',').map((s: string) => parseFloat(s.trim()));
		if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
	}
	return [47.4979, 19.0402];
})();
const DEFAULT_ZOOM = CONFIG.map?.zoom ?? 15;

function openMilestoneModal(milestoneId: string) {
	handleMilestoneOpened(milestoneId, true);
	eventBus.emit('ms_map', milestoneId);
}

function openMarkerPopup(milestoneId: string) {
	// Check if component is unmounted
	if (isUnmounted) return;

	// If map is not ready yet, store the milestone ID to open later
	if (!mapInstance.value || markersMap.value.size === 0) {
		pendingMilestoneId = milestoneId;
		return;
	}

	// Only open popup if the milestone exists in current year's data
	const milestoneExists = milestonesWithPosition.value.some((m) => m.id === milestoneId);
	if (!milestoneExists) return;

	const marker = markersMap.value.get(milestoneId);
	if (marker && mapInstance.value) {
		// Close any existing popup first
		mapInstance.value.closePopup();
		// Pan to marker (smoother than setView) and open popup
		const latLng = marker.getLatLng();
		mapInstance.value.panTo(latLng);
		marker.openPopup();
	}
}

function initMap() {
	if (typeof window === 'undefined' || !mapContainer.value) return;

	// Dynamic import of Leaflet
	import('leaflet').then((L) => {
		// Check if component was unmounted during async import
		if (isUnmounted || !mapContainer.value) return;

		// If map already exists, just update markers
		if (mapInstance.value) {
			updateMarkers(L.default);
			return;
		}

		// Initialize map
		mapInstance.value = L.default.map(mapContainer.value!, {
			center: DEFAULT_CENTER,
			zoom: DEFAULT_ZOOM,
		});

		// Add OpenStreetMap tiles
		L.default
			.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				maxZoom: 19,
			})
			.addTo(mapInstance.value);

		// Create markers layer
		markersLayer.value = L.default.layerGroup().addTo(mapInstance.value);

		// Add markers
		updateMarkers(L.default);

		// Open pending milestone popup if any
		if (pendingMilestoneId) {
			const milestoneId = pendingMilestoneId;
			pendingMilestoneId = null;
			openMarkerPopup(milestoneId);
		}
	});
}

function updateMarkers(L: any) {
	if (isUnmounted || !markersLayer.value || !mapInstance.value) return;

	// Close any open popups before clearing markers
	mapInstance.value.closePopup();

	// Clear existing markers
	markersLayer.value.clearLayers();
	markersMap.value.clear();

	const bounds: [number, number][] = [];

	milestonesWithPosition.value.forEach((milestone) => {
		if (!milestone.position) return;

		const { lat, lng } = milestone.position;
		bounds.push([lat, lng]);

		// Create custom icon
		const icon = L.divIcon({
			className: 'milestone-marker',
			html: `<div class="marker-pin"></div>`,
			iconSize: [30, 42],
			iconAnchor: [15, 42],
			popupAnchor: [0, -42],
		});

		// Create marker
		const marker = L.marker([lat, lng], { icon });

		// Create popup content
		const popupContent = `
			<div class="milestone-popup">
				<div class="milestone-popup-image" style="background-image: url('${assetPrefix || ''}${milestone.picture}')"></div>
				<h5 class="milestone-popup-title">${milestone.title}</h5>
				<button class="btn btn-sm btn-primary milestone-popup-btn" data-milestone-id="${milestone.id}">
					<i class="far fa-hand-point-right mr-1"></i>
					Részletek
				</button>
			</div>
		`;

		marker.bindPopup(popupContent, {
			maxWidth: 300,
			minWidth: 200,
		});

		// Handle popup open to bind click event
		marker.on('popupopen', () => {
			const btn = document.querySelector(
				`.milestone-popup-btn[data-milestone-id="${milestone.id}"]`,
			);
			if (btn) {
				btn.addEventListener('click', () => {
					exitFullscreen();
					if (detailsHandler) {
						detailsHandler(milestone.id);
					} else {
						openMilestoneModal(milestone.id);
					}
				});
			}
		});

		markersLayer.value.addLayer(marker);
		markersMap.value.set(milestone.id, marker);
	});

	// Fit bounds if there are markers and no default center is overridden
	if (bounds.length > 0 && !CONFIG.map?.center) {
		if (bounds.length === 1) {
			mapInstance.value.setView(bounds[0], DEFAULT_ZOOM);
		} else {
			mapInstance.value.fitBounds(bounds, { padding: [150, 150] });
		}
	}
}

// Watch for year changes to update markers
watch(year, () => {
	if (mapInstance.value && !isUnmounted) {
		import('leaflet').then((L) => {
			if (!isUnmounted) {
				updateMarkers(L.default);
			}
		});
	}
});

function getNextId(index: number): string {
	return milestonesWithPosition.value[(index + 1) % milestonesWithPosition.value.length]?.id || '';
}

function getPrevId(index: number): string {
	const length = milestonesWithPosition.value.length;
	return milestonesWithPosition.value[(length + index - 1) % length]?.id || '';
}

const tag = ref<string | null>(null);

function handleKeyup(e: KeyboardEvent) {
	const $ = window.$;
	if (e.key === 'ArrowLeft') {
		$('.modal.show .prev').click();
	} else if (e.key === 'ArrowRight') {
		$('.modal.show .next').click();
	}
}

function exitFullscreen() {
	const doc = document as Document & {
		webkitFullscreenElement?: Element;
		webkitExitFullscreen?: () => Promise<void>;
	};
	if (doc.fullscreenElement || doc.webkitFullscreenElement) {
		(doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
	}
}

function toggleFullscreen() {
	if (!mapWrapper.value) return;
	const doc = document as Document & {
		webkitFullscreenElement?: Element;
		webkitExitFullscreen?: () => Promise<void>;
	};
	const el = mapWrapper.value as HTMLElement & {
		webkitRequestFullscreen?: () => Promise<void>;
	};
	if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
		(el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
	} else {
		(doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
	}
}

function handleFullscreenChange() {
	const doc = document as Document & { webkitFullscreenElement?: Element };
	isFullscreen.value = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
	if (mapInstance.value) {
		setTimeout(() => mapInstance.value?.invalidateSize(), 200);
	}
}

onMounted(() => {
	initMap();
	const $ = window.$;

	document.addEventListener('keyup', handleKeyup);
	document.addEventListener('fullscreenchange', handleFullscreenChange);
	document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

	eventBus.on('ms_map', (id) => {
		tag.value = null;
		nextTick(() => {
			const modal = $('#milestone-modal-map-' + id);
			if (modal.length > 0) {
				modal.modal('show');
			}
		});
	});

	eventBus.on('jump_map', (milestoneId) => {
		openMarkerPopup(milestoneId);
	});

	$(document).on('show.bs.modal', '.modal', function () {
		const modalId = $(this).attr('id');
		if (modalId?.startsWith('milestone-modal-map-')) {
			const milestoneId = modalId.replace('milestone-modal-map-', '');
			handleMilestoneOpened(milestoneId, true);
			openMarkerPopup(milestoneId);
		}
	});

	$(document).on('hide.bs.modal', '.modal', function () {
		const modalId = $(this).attr('id');
		if (modalId?.startsWith('milestone-modal-map-')) {
			handleMilestoneClosed(true);
		}
	});
});

onUnmounted(() => {
	isUnmounted = true;

	// Clean up event listeners
	eventBus.off('ms_map');
	eventBus.off('jump_map');
	document.removeEventListener('keyup', handleKeyup);
	document.removeEventListener('fullscreenchange', handleFullscreenChange);
	document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);

	// Clean up jQuery event handlers
	if (window.$) {
		window.$(document).off('show.bs.modal', '.modal');
		window.$(document).off('hide.bs.modal', '.modal');
	}

	// Clear markers map before removing the map
	markersMap.value.clear();
	markersLayer.value = null;

	if (mapInstance.value) {
		mapInstance.value.remove();
		mapInstance.value = null;
	}
});
</script>

<template>
	<section
		class="page-section"
		id="map"
	>
		<div class="container-fluid">
			<div
				v-for="(m, i) in milestonesWithPosition"
				:key="'mapmodal-' + m.id"
			>
				<Milestone
					:milestone="m"
					:nextId="getNextId(i)"
					:prevId="getPrevId(i)"
					:mapModal="true"
				/>
			</div>

			<div class="row">
				<div class="col text-center">
					<SectionHeading
						:title="CONFIG.map?.title || 'Fejlesztések térképen'"
						:year="year"
					/>
					<hr class="divider my-4 mb-5" />
				</div>
			</div>
			<div class="row">
				<div class="col">
					<div class="map-section-container">
						<div
							ref="mapWrapper"
							class="map-wrapper"
						>
							<div
								ref="mapContainer"
								class="map-container"
							/>
							<button
								type="button"
								class="map-fullscreen-btn"
								:title="isFullscreen ? 'Kilépés a teljes képernyőből' : 'Teljes képernyő'"
								:aria-label="isFullscreen ? 'Kilépés a teljes képernyőből' : 'Teljes képernyő'"
								@click="toggleFullscreen"
							>
								<i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/functions';
@import '../../node_modules/bootstrap/scss/variables';
@import '../../node_modules/bootstrap/scss/mixins';

// Import Leaflet CSS
@import 'leaflet/dist/leaflet.css';

.map-section-container {
	max-width: 1000px;
	margin: 0 auto;
}

.map-wrapper {
	position: relative;
}

.map-wrapper:fullscreen {
	width: 100vw;
	height: 100vh;
	background: #fff;

	.map-container {
		width: 100%;
		height: 100%;
	}
}

.map-wrapper:-webkit-full-screen {
	width: 100vw;
	height: 100vh;
	background: #fff;

	.map-container {
		width: 100%;
		height: 100%;
	}
}

.map-fullscreen-btn {
	position: absolute;
	top: 10px;
	right: 10px;
	z-index: 999;
	width: 34px;
	height: 34px;
	padding: 0;
	background: #fff;
	border: 2px solid rgba(0, 0, 0, 0.2);
	border-radius: 4px;
	color: #333;
	font-size: 16px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

	&:hover {
		background: #f4f4f4;
	}

	&:focus {
		outline: none;
	}
}

.map-container {
	width: 100%;
	height: 500px;
	overflow: hidden;
	position: relative;
	z-index: 1;

	@include media-breakpoint-up(md) {
		height: 600px;
	}

	// Fix Leaflet z-index issues
	.leaflet-pane {
		z-index: 1;
	}

	.leaflet-top,
	.leaflet-bottom {
		z-index: 2;
	}
}

// Custom marker styles
.milestone-marker {
	background: transparent;
	border: none;

	.marker-pin {
		width: 30px;
		height: 30px;
		border-radius: 50% 50% 50% 0;
		background: $primary; // Fallback, overridden by theme
		position: absolute;
		transform: rotate(-45deg);
		left: 50%;
		top: 50%;
		margin: -15px 0 0 -15px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

		&::after {
			content: '';
			width: 14px;
			height: 14px;
			margin: 8px 0 0 8px;
			background: white;
			position: absolute;
			border-radius: 50%;
		}
	}
}

// Popup styles
.milestone-popup {
	text-align: center;
	padding: 10px;

	.milestone-popup-image {
		width: 100%;
		height: 120px;
		background-size: cover;
		background-position: center;
		margin-bottom: 10px;
	}

	.milestone-popup-title {
		font-size: 1rem;
		margin-bottom: 10px;
		color: $dark;
	}

	.milestone-popup-btn {
		width: 100%;
	}
}

// Override Leaflet popup styles
.leaflet-popup-content-wrapper {
	border-radius: 4px;
}

.leaflet-popup-content {
	margin: 10px;
}

.leaflet-popup-close-button {
	font-size: 24px !important;
	width: 24px !important;
	height: 24px !important;
}
</style>
