<!-- FIXME enforce 4 digits and space prefix in year names-->
<!-- TODO LATER replace confirm calls with AlertDialogs -->
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
