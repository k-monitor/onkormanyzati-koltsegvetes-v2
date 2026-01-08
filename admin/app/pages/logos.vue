<script setup lang="ts">
// FIXME admin SSR error
const logos = [
	{
		name: 'logo.png',
		text: 'Város logó (fent)',
		format: 'PNG, max. 300x300 (négyzet!)',
	},
	{ name: 'cover.jpg', text: 'Fejléc', format: 'JPG, max. 1920x1080' },
	{
		name: 'face.png',
		text: 'Polgárm. arckép',
		format: 'PNG, max. 250x250 (négyzet!)',
	},
	{
		name: 'pub.jpg',
		text: 'Kiadvány borítója',
		format: 'JPG, max. 500x500 (arány mindegy)',
	},
	{
		name: 'logo-footer.png',
		text: 'Város logó (lábléc)',
		format: 'PNG, max. 500x500',
	},
	{
		name: 'ogimage.jpg',
		text: 'Facebook bélyegkép',
		format: 'JPG, <a href="https://developers.facebook.com/docs/sharing/webmasters/images/" target="_blank">méretek</a>',
	},
	{
		name: 'favicon.png',
		text: 'Favicon (böngésző ikon)',
		format: 'PNG, max. 256x256 (négyzet!)',
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
	<h1>Logók</h1>
	<p>
		A feltöltött fájlok neve mindegy, azonban a formátum kötött. A képeket feltöltés előtt az
		ajánlott méretre kell alakítani, megfelelő formátumba menteni, és
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
	<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3 mt-4"></div>
	<div
		class="col"
		v-for="f in logos"
	>
		<div class="card shadow-sm">
			<div class="ratio ratio-16x9">
				<a
					class="card-img-top bg-secondary d-flex align-items-center justify-content-center"
					:href="logoUrl(f.name)"
					style="background-position: center; background-repeat: no-repeat"
					:style="{
						backgroundImage: `url(${logoUrl(f.name)}?${r})`,
						backgroundSize: f.name.match(/face|favicon|logo|pub/) ? 'contain' : 'cover',
					}"
					target="_blank"
				>
				</a>
			</div>
			<div class="card-footer d-flex align-items-center px-1">
				<div class="flex-grow-1 text-truncate">
					{{ f.text }}
					<br />
					<small v-html="f.format"></small>
				</div>
				<label class="btn btn-sm btn-success">
					<i class="fas fa-fw fa-upload"></i>
					<input
						style="display: none"
						type="file"
						@change="uploadLogo($event, f.name)"
					/>
				</label>
			</div>
		</div>
	</div>
</template>
