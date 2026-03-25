<script setup lang="ts">
import type ExcelJS from 'exceljs';
import { CircleAlert, Plus } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import defaultEconNodeList from '~/assets/default-econ-node-list.tsv?raw';

const { loadBudgetXlsxFromServer, uploadBudgetXlsxToServer, workbook, years } =
	await useBudgetData();

const newNameEl = useTemplateRef('newNameEl');
onMounted(() => {
	newNameEl.value?.$el?.focus();
});

const newNameInput = ref('');
const newYear = computed(() => newNameInput.value.replaceAll(/\s+/g, ' ').trim());

const isValid = computed(() => isValidYear(newYear.value));
const alreadyExists = computed(() => Object.keys(years.value || {}).includes(newYear.value));

const copyOptions = computed(() => [
	{ value: 'NOTHING' as const, label: 'Maradjanak üresen' },
	{ value: 'FULLTREE' as const, label: 'Teljes közgazdasági fa 0 értékekkel' },
	{ value: 'EXISTING' as const, label: 'Másolás innen:' },
]);
const copy = ref<(typeof copyOptions.value)[number]['value']>();
const yearOptions = computed(() => Object.keys(years.value || {}).reverse());
const sourceYear = ref(yearOptions.value[0] || '');

const canAddNewYear = computed(
	() =>
		isValid.value &&
		!alreadyExists.value &&
		!!copy.value &&
		(copy.value !== 'EXISTING' || !!sourceYear.value),
);

const router = useRouter();

async function handleAdd() {
	if (!workbook.value) return;
	if (!canAddNewYear.value) return;

	try {
		if (copy.value === 'EXISTING') {
			const names = [
				{
					source: years.value?.[sourceYear.value]?.incomeSheet,
					target: `${newYear.value} BEVÉTEL`,
				},
				{
					source: years.value?.[sourceYear.value]?.expenseSheet,
					target: `${newYear.value} KIADÁS`,
				},
			];
			for (const { source, target } of names) {
				if (!source || !workbook.value.getWorksheet(source)) {
					throw new Error(`A munkalap nem található: ${source}`);
				}
				if (workbook.value.getWorksheet(target)) {
					throw new Error(`A munkalap már létezik: ${target}`);
				}

				const newSheet = cloneSheet(workbook.value, source, target);
				if (!newSheet) {
					throw new Error(`Nem sikerült klónozni a munkalapot: ${source} -> ${target}`);
				}
				newSheet.getCell('A1').value = target;
			}
		} else {
			const sheets = [
				{ name: `${newYear.value} BEVÉTEL`, nodeIdPrefix: 'B' },
				{ name: `${newYear.value} KIADÁS`, nodeIdPrefix: 'K' },
			];
			for (const { name, nodeIdPrefix } of sheets) {
				const rows: Array<Array<ExcelJS.CellValue>> = [
					[name],
					['#', 'Megnevezés', 'Összeg'],
				];
				if (copy.value === 'FULLTREE') {
					const tsvLines = defaultEconNodeList.split('\n');
					for (const line of tsvLines) {
						const [id, label] = line.split('\t');
						if (id?.startsWith(nodeIdPrefix) && label) {
							rows.push([99, `${label} (${id})`, 0]);
						}
					}
				}
				createSheet(workbook.value, name, rows);
			}
		}

		await uploadBudgetXlsxToServer();
		await loadBudgetXlsxFromServer();
		await router.replace(`/budget/${slugifyYear(newYear.value)}/`);
		toast.success('Év sikeresen hozzáadva!');
	} catch (e: unknown) {
		console.error(e);
		toast.error('Nem sikerült hozzáadni az évet.');
	}
}
</script>

<template>
	<PageFrame title="Év hozzáadása">
		<form @submit.prevent="handleAdd">
			<PageSection>
				<p>Év hozzáadását Excel-ben javasoljuk, de itt is lehetőség van rá.</p>
				<NewYearInput
					v-model="newNameInput"
					:default-year="''"
				/>
				<Alert
					v-if="!isValid"
					class="not-prose mb-8"
					variant="destructive"
				>
					<CircleAlert />
					<AlertTitle>Az év elnevezésének 4 számjeggyel kell kezdődnie!</AlertTitle>
				</Alert>
				<Alert
					v-if="alreadyExists"
					class="not-prose mb-8"
					variant="destructive"
				>
					<CircleAlert />
					<AlertTitle>Ilyen év már létezik!</AlertTitle>
				</Alert>

				<template v-if="isValid && !alreadyExists">
					<p>
						Az alábbi munkalapok fognak létrejönni a <code>budget.xlsx</code> fájlban:
					</p>
					<ul>
						<li>
							<code>{{ newYear }} BEVÉTEL</code>
						</li>
						<li>
							<code>{{ newYear }} KIADÁS</code>
						</li>
					</ul>
					<p>Milyen költségvetési sorokkal legyenek feltöltve az új munkalapok?</p>
					<div class="not-prose mb-12">
						<RadioGroup v-model="copy">
							<div
								v-for="o in copyOptions"
								:key="o.value"
								class="flex items-center space-x-2"
							>
								<RadioGroupItem
									:id="o.value"
									:value="o.value"
								/>
								<Label :for="o.value">{{ o.label }}</Label>
								<template v-if="o.value === 'EXISTING'">
									<Select
										v-model="sourceYear"
										:disabled="copy !== 'EXISTING'"
									>
										<SelectTrigger>
											<SelectValue placeholder="Válassz ki egy évet" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												v-for="y in Object.keys(years || {}).reverse()"
												:key="y"
												:value="y"
											>
												{{ y }}
											</SelectItem>
										</SelectContent>
									</Select>
								</template>
							</div>
						</RadioGroup>
					</div>
				</template>

				<template #actions>
					<Button :disabled="!canAddNewYear">
						<Plus />
						Hozzáadás
					</Button>
				</template>
			</PageSection>
		</form>
	</PageFrame>
	<!-- eslint-disable-next-line vue/no-multiple-template-root -->
	<BudgetSaveBanner />
</template>
