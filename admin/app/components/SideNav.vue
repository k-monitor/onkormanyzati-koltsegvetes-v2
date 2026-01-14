<script setup lang="ts">
import { CalendarDays, Globe, Image, Scale, Settings } from 'lucide-vue-next';

const { data, pending, refresh } = await useBudgetData();

const years = computed(() =>
	Object.keys(data.value || {})
		.sort((a, b) => b.localeCompare(a))
		.map((y) => ({
			href: `/budget/${y}/`, // FIXME probably need slugify
			text: y,
			icon: CalendarDays,
		})),
);

const links = computed(() => {
	return [
		{ href: '/budget/', text: 'Költségvetés', icon: Scale, items: years.value },
		{ href: '/config/', text: 'Konfiguráció', icon: Settings },
		{ href: '/logos/', text: 'Logók', icon: Image },
		{ href: '/milestones/', text: 'Fejlesztéskártyák képei', icon: Image },
		{ href: '/site/', text: 'Weboldal', icon: Globe },
	];
});

onMounted(() => {
	refresh();
});
</script>
<template>
	<Sidebar>
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg">
						<div class="grid flex-1 text-left text-lg leading-tight">
							<span class="truncate font-semibold">KÖKÖ Admin</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
		<SidebarContent :class="pending ? 'pointer-events-none opacity-50 select-none' : ''">
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem
							v-for="(link, index) in links"
							:key="link.href"
						>
							<SidebarMenuButton
								as-child
								:is-active="$route.path === link.href"
							>
								<NuxtLink :to="link.href">
									<component
										v-if="link.icon"
										:is="link.icon"
									/>
									{{ link.text }}
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
												v-if="item.icon"
												:is="item.icon"
											/>{{ item.text }}
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
