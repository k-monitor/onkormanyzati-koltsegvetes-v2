<script setup lang="ts">
import { Banknote, Globe, Images, Settings } from 'lucide-vue-next';

const links = [
	{ href: '/budget/', text: 'Költségvetés', icon: Banknote },
	{ href: '/config/', text: 'Konfiguráció', icon: Settings },
	{ href: '/logos/', text: 'Logók', icon: Images },
	{ href: '/milestones/', text: 'Fejlesztéskártyák képei', icon: Images },
	{ href: '/site/', text: 'Weboldal', icon: Globe },
];
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
		<SidebarContent>
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
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
		<SidebarFooter />
		<SidebarRail />
	</Sidebar>
</template>
