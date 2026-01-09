<script setup lang="ts">
import { Upload } from 'lucide-vue-next';

const logos = [
	{
		name: 'logo.png',
		text: 'Város logó (fent)',
		format: 'PNG, négyzet<br>max. 300x300',
	},
	{ name: 'cover.jpg', text: 'Fejléc', format: 'JPG<br>max. 1920x1080' },
	{
		name: 'face.png',
		text: 'Polgárm. arckép',
		format: 'PNG, négyzet<br>max. 250x250',
	},
	{
		name: 'pub.jpg',
		text: 'Kiadvány borítója',
		format: 'JPG<br>ax. 500x500',
	},
	{
		name: 'logo-footer.png',
		text: 'Város logó (lábléc)',
		format: 'PNG<br>max. 500x500',
	},
	{
		name: 'ogimage.jpg',
		text: 'Facebook bélyegkép',
		format: 'JPG<br><a href="https://developers.facebook.com/docs/sharing/webmasters/images/" target="_blank">méretek</a>',
	},
	{
		name: 'favicon.png',
		text: 'Favicon (böngésző ikon)',
		format: 'PNG, négyzet<br>max. 256x256',
	},
];

const r = ref(0);

function logoUrl(logo: string) {
	const path = '/static/assets/img';
	return `${path}/${logo}`;
}

async function uploadLogo(e: Event, f: string) {
	await upload(`/api/logo/${f}`, 'logo', e.target as HTMLInputElement);
	r.value = Math.random(); // update logo on UI ;)
}
</script>
<template>
	<main class="prose mx-auto my-16">
		<h1>Logók</h1>
		<p>
			A feltöltött fájlok neve mindegy, azonban a formátum kötött. A képeket feltöltés előtt
			az ajánlott méretre kell alakítani, megfelelő formátumba menteni, és
			<a
				href="https://www.tinyjpg.com/"
				target="_blank"
				>TinyJPG</a
			>
			segítségével optimalizálni.
		</p>
		<p>
			A Facebook bélyegkép cserélése és a site újragenerálása után a Facebook szervereit is
			frissíteni kell, ez
			<a
				href="https://developers.facebook.com/tools/debug/"
				target="_blank"
				>itt</a
			>
			tehető meg, az URL beírása után a <em>Scrape again</em> gombra kattinva.
		</p>
	</main>

	<div class="container mx-auto px-16 my-16">
		<ItemGroup class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			<Item
				v-for="f in logos"
				:key="f.name"
				role="listitem"
				variant="outline"
			>
				<ItemHeader>
					<a
						:href="logoUrl(f.name)"
						class="aspect-16/9 bg-foreground/5 rounded-sm w-full"
						style="background-position: center; background-repeat: no-repeat"
						:style="{
							backgroundImage: `url(${logoUrl(f.name)}?${r})`,
							backgroundSize: f.name.match(/face|favicon|logo|pub/)
								? 'contain'
								: 'cover',
						}"
						target="_blank"
						>&nbsp;
					</a>
				</ItemHeader>
				<ItemContent>
					<ItemTitle>{{ f.text }}</ItemTitle>
					<ItemDescription v-html="f.format"></ItemDescription>
				</ItemContent>
				<ItemActions>
					<Button as-child>
						<label class="cursor-pointer">
							<Upload />
							<input
								style="display: none"
								type="file"
								@change="uploadLogo($event, f.name)"
							/>
						</label>
					</Button>
				</ItemActions>
			</Item>
		</ItemGroup>
	</div>
</template>
