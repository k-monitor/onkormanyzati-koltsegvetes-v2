<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next';

const links = [
	{
		href: 'https://github.com/k-monitor/onkormanyzati-koltsegvetes-v2',
		text: 'Dokumentáció',
	},
	{
		href: 'https://docs.google.com/document/u/1/d/e/2PACX-1vTXFt_lgaWxek33RM6kO4OtAq5Ja1FntR0kbyCWWjEAI577wcj6aKKLwznxUdY_EHM1NylPGiDSZ9QN/pub',
		text: 'Súgó',
	},
];

const kokoUrl = usePublicUrl();

if (kokoUrl.value) {
	links.push({
		href: kokoUrl.value,
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
							class="flex flex-row items-center gap-2"
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
