<script setup lang="ts">
const { year, handleMilestoneOpened, handleMilestoneClosed } = useYear();

const { assetPrefix, detailsHandler } = defineProps<{
	assetPrefix?: string;
	detailsHandler?: (milestoneId: string) => void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
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

// Default map center and zoom
const DEFAULT_CENTER: [number, number] = [47.4979, 19.0402];
const DEFAULT_ZOOM = 15;

function openMilestoneModal(milestoneId: string) {
	handleMilestoneOpened(milestoneId, true);
	eventBus.emit('ms-map', milestoneId);
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

	// Fit bounds if there are markers
	if (bounds.length > 0) {
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

onMounted(() => {
	initMap();
	const $ = window.$;

	document.onkeyup = function (e) {
		e = e || window.event;
		if (e.keyCode == 37) {
			$('.modal.show .prev').click();
		} else if (e.keyCode == 39) {
			$('.modal.show .next').click();
		}
	};

	eventBus.on('ms-map', (id) => {
		tag.value = null;
		nextTick(() => {
			const modal = $('#milestone-modal-map-' + id);
			if (modal.length > 0) {
				modal.modal('show');
			}
		});
	});

	eventBus.on('jump-map', (milestoneId) => {
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
	eventBus.off('ms-map');
	eventBus.off('jump-map');
	document.onkeyup = null;

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
							ref="mapContainer"
							class="map-container"
						></div>
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
