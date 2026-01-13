<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next';

const links = [
	{
		href: 'https://github.com/k-monitor/onkormanyzati-koltsegvetes-v2',
		text: 'Dokumentáció',
	},
];

const {
	public: { url: kokoUrl },
} = useRuntimeConfig();

if (kokoUrl) {
	links.push({
		href: kokoUrl,
		text: 'KÖKÖ',
	});
}
</script>
<template>
	<div class="flex items-center justify-between p-2">
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<SidebarTrigger />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem
					v-for="link in links"
					:key="link.href"
				>
					<NavigationMenuLink as-child>
						<NuxtLink
							class="flex flex-row gap-2 items-center"
							:href="link.href"
							target="_blank"
						>
							{{ link.text }}
							<ExternalLink />
						</NuxtLink>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	</div>
</template>
