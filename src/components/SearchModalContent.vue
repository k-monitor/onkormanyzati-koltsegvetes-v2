<script setup lang="ts">
const { year } = defineProps<{ year: string }>();

type Suffix = {
	label: string;
	value: number;
};
const SUFFIX_1K: Suffix = { label: 'ezer Ft', value: 1000 };
const SUFFIX_1M: Suffix = { label: 'millió Ft', value: 1000000 };
const SUFFIX_1B: Suffix = { label: 'milliárd Ft', value: 1000000000 };
const suffixes: Suffix[] = [SUFFIX_1K, SUFFIX_1M, SUFFIX_1B];
const suffix = ref(SUFFIX_1M);

const searchTerm = ref('');
const savedSearchTerms = ref<string[]>([]);
const valueTerm = ref('');

const range = computed(() => {
	const valueSearch = valueTerm.value.match(/^\d+(-\d+)?$/);
	if (!valueSearch) return [];
	const parts = valueTerm.value.split('-');
	const min = parseInt(parts[0] || '0', 10);
	const max = parseInt(parts[1] || parts[0] || '0', 10);
	const res = min === max ? [min] : [min, max];
	return res.map((r) => r * suffix.value.value);
});

const results = computed(() => {
	if (searchTerm.value.length < 3 && range.value.length == 0) return [];
	const valueSearch = range.value.length > 0;
	return search(year, searchTerm.value, range.value)
		.filter((r) => r.side != 'income' || CONFIG.modules.income)
		.sort(function (a, b) {
			function score(r) {
				// TODO LATER search result type
				if (r.matchedId) return 1000;
				if (valueSearch) return r.distance * -1;
				return (r.matchesInName || 0) + (r.tags || []).length;
			}
			const sa = score(a);
			const sb = score(b);
			return sa == sb ? (b.value || 0) - (a.value || 0) : sb - sa;
		})
		.map((r) => {
			searchTerm.value.split(' ').forEach((t) => {
				t = t.trim();
				if (t.length >= 3) {
					r.name = (r.name || '').replace(new RegExp(`(${t})`, 'i'), '<u>$1</u>');
				}
			});
			return r;
		})
		.slice(0, 5);
});

let searchTimeout: number | undefined = undefined;
watch(searchTerm, (term, oldTerm) => {
	// TODO LATER jQuery -> Axios
	const $ = window.$;

	function track(term: string) {
		const prefix = savedSearchTerms.value.some((sst) => sst.indexOf(term) == 0);
		if (!prefix) {
			savedSearchTerms.value.push(term);
			const url = `/track-search.php?t=${term}&r=${search(year, term).length}`;
			$.get(url);
		}
	}

	clearTimeout(searchTimeout);
	if (term.length == oldTerm.length - 1) {
		// immediate reaction to backspace
		track(oldTerm);
	} else if (term.length >= 3) {
		searchTimeout = setTimeout(function () {
			track(term);
		}, 1000);
	}
});

function jump(result: SearchResult) {
	// TODO LATER eliminate jQuery (might need Bootstrap-Vue)
	const $ = window.$;

	$('#search-modal').modal('hide');
	if ($('#mainNav .show').length > 0) $('#mainNav button').click();
	scrollToElement($('#' + result.side), 72);

	setTimeout(function () {
		if (result.side === 'milestones') {
			eventBus.emit('ms', result.id);
		} else {
			eventBus.emit('jump', result);
		}
	}, 1000);
}

onMounted(() => {
	// TODO LATER eliminate jQuery
	const $ = window.$;
	$('#search-modal').on('show.bs.modal', () => (searchTerm.value = ''));
	$('#search-modal').on('shown.bs.modal', () => $('#searchTerm-input').focus());
});
</script>

<template>
	<div
		class="modal-dialog modal-lg"
		role="document"
	>
		<div class="modal-content">
			<div class="modal-header">
				<div class="d-flex flex-column flex-grow-1">
					<div class="input-group mb-3">
						<div class="input-group-prepend">
							<span
								class="input-group-text"
								id="searchTerm-label"
								><i class="fas fa-fw fa-search"></i
							></span>
						</div>
						<input
							aria-describedby="searchTerm-label"
							aria-label="Szöveges keresés"
							class="form-control"
							id="searchTerm-input"
							placeholder="Kulcsszó..."
							type="text"
							v-model="searchTerm"
						/>
					</div>
					<div class="input-group">
						<div class="input-group-prepend">
							<span
								class="input-group-text"
								id="valueTerm-label"
								><i class="fas fa-fw fa-money-bill-wave"></i
							></span>
						</div>
						<input
							aria-describedby="valueTerm-label"
							aria-label="Szűrés érték szerint"
							class="form-control"
							placeholder="Érték..."
							type="text"
							v-model="valueTerm"
						/>
						<div class="input-group-append">
							<div class="dropdown">
								<button
									class="btn btn-secondary dropdown-toggle"
									type="button"
									id="dropdownMenuButton"
									data-toggle="dropdown"
									aria-haspopup="true"
									aria-expanded="false"
								>
									{{ suffix.label }}
								</button>
								<div
									class="dropdown-menu"
									aria-labelledby="dropdownMenuButton"
								>
									<a
										v-for="s in suffixes"
										:key="s.value"
										class="dropdown-item"
										href="javascript:void(0)"
										@click="suffix = s"
										v-text="s.label"
									/>
								</div>
							</div>
						</div>
					</div>
					<div class="form-text text-muted text-xs">
						Megadható értéktartomány is,
						<span class="text-nowrap">pl. "10-20"</span>.
					</div>
				</div>
				<button
					class="close pl-0"
					type="button"
				>
					<i
						class="close fas fa-times-circle"
						data-dismiss="modal"
					></i>
				</button>
			</div>
			<div class="modal-body">
				<p
					class="text-center text-muted"
					v-if="results.length == 0"
				>
					<span v-if="searchTerm.length < 3">{{ CONFIG.search.tooShort }}</span>
					<span v-else>{{ CONFIG.search.noResults }}</span>
				</p>
				<div class="list-group">
					<div
						class="d-flex list-group-item"
						v-for="r in results"
						:key="r.side + r.type + r.id"
					>
						<div class="flex-grow-1 font-weight-bold mb-2">
							<span>
								<span v-html="r.name"></span>
								<span
									v-if="r.value"
									class="ml-1 text-nowrap text-secondary"
								>
									({{ groupNums(r.value, true) }})
								</span>
							</span>
							<br />

							<small class="text-muted">({{ CONFIG.search[r.type] }})</small>
							<br />
							<span v-if="(r.tags || '').length > 0">
								<span
									class="badge badge-info font-weight-normal mr-2"
									v-for="t in r.tags"
									:key="t"
									>#{{ t }}</span
								>
								<br />
							</span>
						</div>
						<div>
							<a
								class="ml-2 btn btn-sm"
								:class="
									r.side == 'milestones'
										? 'btn-outline-info'
										: r.side == 'income'
											? 'btn-outline-success'
											: 'btn-outline-danger'
								"
								href="javascript:void(0)"
								@click="jump(r)"
							>
								<i class="far fa-hand-point-right"></i>
								<br />
								{{ CONFIG.search[r.side] }}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
