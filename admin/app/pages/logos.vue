<script setup lang="ts">
import { Upload } from 'lucide-vue-next';

const logos = [
	{
		name: 'favicon.png',
		text: 'Favicon (böngésző ikon)',
		format: 'PNG, négyzet<br>max. 256x256',
		square: true,
	},
	{
		name: 'logo.png',
		text: 'Város logó (fent)',
		format: 'PNG, négyzet<br>max. 300x300',
		square: true,
	},
	{
		name: 'face.png',
		text: 'Polgárm. arckép',
		format: 'PNG, négyzet<br>max. 250x250',
		square: true,
	},
	{
		name: 'ogimage.jpg',
		text: 'Facebook bélyegkép',
		format: 'JPG<br><a href="https://developers.facebook.com/docs/sharing/webmasters/images/" target="_blank">méretek</a>',
	},
	{ name: 'cover.jpg', text: 'Fejléc', format: 'JPG<br>max. 1920x1080' },

	{
		name: 'pub.jpg',
		text: 'Kiadvány borítója',
		format: 'JPG<br>max. 500x500',
	},
	{
		name: 'logo-footer.png',
		text: 'Város logó (lábléc)',
		format: 'PNG<br>max. 500x500',
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
	<PageFrame title="Logók">
		<PageSection class="border-0">
			<p>
				A feltöltött fájlok neve mindegy, azonban a formátum kötött. A képeket feltöltés
				előtt az ajánlott méretre kell alakítani, megfelelő formátumba menteni, és
				<a
					href="https://www.tinyjpg.com/"
					target="_blank"
					>TinyJPG</a
				>
				segítségével optimalizálni.
			</p>
			<p>
				A Facebook bélyegkép cserélése és a site újragenerálása után a Facebook szervereit
				is frissíteni kell, ez
				<a
					href="https://developers.facebook.com/tools/debug/"
					target="_blank"
					>itt</a
				>
				tehető meg, az URL beírása után a <em>Scrape again</em> gombra kattinva.
			</p>
		</PageSection>

		<div class="container mx-auto px-16">
			<ItemGroup class="grid grid-cols-2 gap-4 md:grid-cols-3">
				<Item
					v-for="f in logos"
					:key="f.name"
					role="listitem"
					variant="outline"
				>
					<ItemHeader>
						<a
							:href="logoUrl(f.name)"
							class="bg-foreground/5 w-full rounded-sm"
							:class="f.square ? 'h-24' : 'aspect-video'"
							style="background-position: center; background-repeat: no-repeat"
							:style="{
								backgroundImage: `url(${logoUrl(f.name)}?${r})`,
								backgroundSize: f.name.match(/face|favicon|logo/)
									? '64px'
									: 'cover',
							}"
							target="_blank"
							>&nbsp;
						</a>
					</ItemHeader>
					<ItemContent>
						<ItemTitle>{{ f.text }}</ItemTitle>
						<ItemDescription v-html="f.format" />
					</ItemContent>
					<ItemActions>
						<Button as-child>
							<label>
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
	</PageFrame>
</template>
