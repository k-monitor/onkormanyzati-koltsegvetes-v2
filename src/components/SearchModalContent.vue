<script setup lang="ts">
const { year, handleYearSelected } = useYear();
const router = useRouter();
const route = useRoute();
const { pendingBudgetJump } = usePendingBudgetJump();

type Suffix = {
	label: string;
	value: number;
};
const SUFFIX_1K: Suffix = { label: 'ezer Ft', value: 1000 };
const SUFFIX_1M: Suffix = { label: 'millió Ft', value: 1000000 };
const SUFFIX_1B: Suffix = { label: 'milliárd Ft', value: 1000000000 };
const suffixes: Suffix[] = [SUFFIX_1K, SUFFIX_1M, SUFFIX_1B];
const suffix = ref(SUFFIX_1M);

const availableYears = computed(() => Object.keys(DATA).sort().reverse());
const selectedYear = ref<string | undefined>(undefined); // undefined means all years

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
	return search(selectedYear.value, searchTerm.value, range.value)
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
		.filter((r, i, arr) => arr.findIndex((a) => a.id === r.id) === i)
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
			const url = `/track-search.php?t=${term}&r=${search(year.value, term, []).length}`;
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

	// On the global page, visualization/milestones don't exist — navigate to year page first
	if (route.path === '/') {
		pendingBudgetJump.value = result;
		const targetYear = result.year ? String(result.year) : year.value;
		router.push('/ev#' + slugify(targetYear));
		return;
	}

	// Navigate to the correct year if result is from a different year
	if (result.year && String(result.year) !== year.value) {
		handleYearSelected(String(result.year));
	}

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
								id="searchTerm-label"
								class="input-group-text"
								><i class="fas fa-fw fa-search"
							/></span>
						</div>
						<input
							id="searchTerm-input"
							v-model="searchTerm"
							aria-describedby="searchTerm-label"
							aria-label="Szöveges keresés"
							class="form-control"
							placeholder="Kulcsszó..."
							type="text"
						/>
					</div>
					<div class="input-group mb-3">
						<div class="input-group-prepend">
							<span
								id="yearSelect-label"
								class="input-group-text"
								><i class="fas fa-fw fa-calendar-alt"
							/></span>
						</div>
						<select
							v-model="selectedYear"
							aria-describedby="yearSelect-label"
							aria-label="Év kiválasztása"
							class="form-control"
						>
							<option :value="undefined">Összes év</option>
							<option
								v-for="y in availableYears"
								:key="y"
								:value="y"
							>
								{{ y }}
							</option>
						</select>
					</div>
					<div class="input-group">
						<div class="input-group-prepend">
							<span
								id="valueTerm-label"
								class="input-group-text"
								><i class="fas fa-fw fa-money-bill-wave"
							/></span>
						</div>
						<input
							v-model="valueTerm"
							aria-describedby="valueTerm-label"
							aria-label="Szűrés érték szerint"
							class="form-control"
							placeholder="Érték..."
							type="text"
						/>
						<div class="input-group-append">
							<div class="dropdown">
								<button
									id="dropdownMenuButton"
									class="btn btn-secondary dropdown-toggle"
									type="button"
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
					/>
				</button>
			</div>
			<div class="modal-body">
				<p
					v-if="results.length == 0"
					class="text-center text-muted"
				>
					<span v-if="searchTerm.length < 3">{{ CONFIG.search.tooShort }}</span>
					<span v-else>{{ CONFIG.search.noResults }}</span>
				</p>
				<div class="list-group">
					<div
						v-for="r in results"
						:key="r.side + r.type + r.id"
						class="d-flex list-group-item"
					>
						<div class="flex-grow-1 font-weight-bold mb-2">
							<span>
								<span v-html="r.name" />
								<span
									v-if="r.value"
									class="ml-1 text-nowrap text-secondary"
								>
									({{ groupNums(r.value, true) }})
								</span>
							</span>
							<br />

							<small class="text-muted"
								>({{ CONFIG.search[r.type]
								}}<span v-if="r.year">, {{ r.year }}</span
								>)</small
							>
							<br />
							<span v-if="(r.tags || '').length > 0">
								<span
									v-for="t in r.tags"
									:key="t"
									class="badge badge-info font-weight-normal mr-2"
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
								<i class="far fa-hand-point-right" />
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
