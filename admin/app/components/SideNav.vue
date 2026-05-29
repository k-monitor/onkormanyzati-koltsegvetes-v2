<script setup lang="ts">
import {
	CalendarDays,
	CircleAlert,
	Dot,
	Globe,
	Image,
	PictureInPicture,
	Plus,
	Scale,
	Settings,
} from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const { pending, years } = await useBudgetData();
const { isBudgetModified, isYearModified } = useModifications();

const yearItems = computed(() =>
	Object.keys(years.value || {})
		.sort((a, b) => b.localeCompare(a))
		.map((y) => ({
			href: `/budget/${slugifyYear(y)}/`,
			text: y,
			icon: CalendarDays,
			modified: isYearModified(y),
		})),
);

const links = computed(() => {
	return [
		{
			href: '/budget/',
			text: 'Költségvetés',
			icon: Scale,
			items: [
				{
					href: '/budget/addyear/',
					text: 'Év hozzáadása',
					icon: Plus,
				},
				...yearItems.value,
			],
			modified: isBudgetModified.value,
		},
		{ href: '/config/', text: 'Konfiguráció', icon: Settings },
		{ href: '/logos/', text: 'Logók', icon: Image },
		{ href: '/milestones/', text: 'Fejlesztéskártyák képei', icon: Image },
		{ href: '/site/', text: 'Weboldal', icon: Globe },
		{ href: '/embed/', text: 'Beágyazás', icon: PictureInPicture },
	];
});

const mounted = ref(false);
onMounted(async () => {
	mounted.value = true;
});

const publicUrl = usePublicUrl();
const domain = computed(() => new URL(publicUrl.value).hostname);

const { cityName } = useCityName();
</script>

<template>
	<Sidebar>
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						class="h-auto"
						size="lg"
					>
						<div class="grid flex-1 text-left text-lg leading-tight">
							<span class="truncate font-semibold">KÖKÖ Admin</span>
							<span class="truncate text-2xl font-bold">{{ cityName }}</span>
							<span class="text-muted-foreground text-sm">{{ domain }}</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
		<SidebarContent
			class="transition-opacity"
			:class="cn((!mounted || pending) && 'pointer-events-none opacity-50 select-none')"
		>
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem
							v-for="link in links"
							:key="link.href"
						>
							<SidebarMenuButton
								as-child
								:is-active="$route.path === link.href"
							>
								<NuxtLink :to="link.href">
									<component
										:is="link.icon"
										v-if="link.icon"
									/>
									{{ link.text }}
									<CircleAlert
										v-if="link.modified"
										class="text-modification ml-auto"
									/>
								</NuxtLink>
							</SidebarMenuButton>
							<SidebarMenuSub v-if="link.items">
								<SidebarMenuSubItem
									v-for="item in link.items"
									:key="item.href"
								>
									<SidebarMenuSubButton
										as-child
										:is-active="$route.path === item.href"
									>
										<NuxtLink :to="item.href">
											<component
												:is="item.icon"
												v-if="item.icon"
											/>{{ item.text }}
											<Dot
												v-if="item.modified"
												class="text-modification! ml-auto size-8!"
											/>
										</NuxtLink>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							</SidebarMenuSub>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
		<SidebarFooter />
		<SidebarRail />
	</Sidebar>
</template>
