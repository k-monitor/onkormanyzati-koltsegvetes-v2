<script setup lang="ts">
import 'vue-sonner/style.css';

// TODO LATER replace confirm calls with AlertDialogs
</script>

<template>
	<div>
		<NuxtRouteAnnouncer />
		<SidebarProvider>
			<SideNav />
			<SidebarInset>
				<TopNav />
				<NuxtPage />
			</SidebarInset>
		</SidebarProvider>
		<LoadingOverlay />
		<Toaster
			position="top-center"
			rich-colors
		/>
	</div>
</template>
