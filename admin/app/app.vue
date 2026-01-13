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
	</div>
</template>
