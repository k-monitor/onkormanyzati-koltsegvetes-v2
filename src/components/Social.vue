<script setup lang="ts">
const fb = `https://facebook.com/sharer/sharer.php?u=${CONFIG.url}`;
const tw = `https://twitter.com/intent/tweet/?text=${CONFIG.social.text}&url=${CONFIG.url}`;
const li = `https://www.linkedin.com/shareArticle?mini=true&url=${
	CONFIG.url
}&title=${CONFIG.social.text}&summary=&source=${CONFIG.url}`;
const ml = `mailto:?subject=${CONFIG.social.text}&body=${CONFIG.url}`;
</script>
<template>
	<div id="sharingbuttons">
		<!-- Sharingbutton Facebook -->
		<a
			class="resp-sharing-button__link"
			:href="fb"
			target="_blank"
			rel="noopener"
			aria-label=""
		>
			<div
				class="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--small"
			>
				<div
					aria-hidden="true"
					class="resp-sharing-button__icon resp-sharing-button__icon--solid"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<path
							d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"
						/>
					</svg>
				</div>
			</div>
		</a>

		<!-- Sharingbutton Twitter -->
		<a
			class="resp-sharing-button__link"
			:href="tw"
			target="_blank"
			rel="noopener"
			aria-label=""
		>
			<div
				class="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--small"
			>
				<div
					aria-hidden="true"
					class="resp-sharing-button__icon resp-sharing-button__icon--solid"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<path
							d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"
						/>
					</svg>
				</div>
			</div>
		</a>

		<!-- Sharingbutton LinkedIn -->
		<a
			class="resp-sharing-button__link"
			:href="li"
			target="_blank"
			rel="noopener"
			aria-label=""
		>
			<div
				class="resp-sharing-button resp-sharing-button--linkedin resp-sharing-button--small"
			>
				<div
					aria-hidden="true"
					class="resp-sharing-button__icon resp-sharing-button__icon--solid"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<path
							d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.4 2.5-2.4c1.6 0 2.5 1 2.6 2.5 0 1.4-1 2.5-2.6 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.3v6.7h-5v-7c0-1-1-2-2-2z"
						/>
					</svg>
				</div>
			</div>
		</a>

		<!-- Sharingbutton E-Mail -->
		<a
			class="resp-sharing-button__link"
			:href="ml"
			target="_self"
			rel="noopener"
			aria-label=""
		>
			<div class="resp-sharing-button resp-sharing-button--email resp-sharing-button--small">
				<div
					aria-hidden="true"
					class="resp-sharing-button__icon resp-sharing-button__icon--solid"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<path
							d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.25 14.43l-3.5 2c-.08.05-.17.07-.25.07-.17 0-.34-.1-.43-.25-.14-.24-.06-.55.18-.68l3.5-2c.24-.14.55-.06.68.18.14.24.06.55-.18.68zm4.75.07c-.1 0-.2-.03-.27-.08l-8.5-5.5c-.23-.15-.3-.46-.15-.7.15-.22.46-.3.7-.14L12 13.4l8.23-5.32c.23-.15.54-.08.7.15.14.23.07.54-.16.7l-8.5 5.5c-.08.04-.17.07-.27.07zm8.93 1.75c-.1.16-.26.25-.43.25-.08 0-.17-.02-.25-.07l-3.5-2c-.24-.13-.32-.44-.18-.68s.44-.32.68-.18l3.5 2c.24.13.32.44.18.68z"
						/>
					</svg>
				</div>
			</div>
		</a>
	</div>
</template>

<style lang="scss">
@import '../scss/variables';
@import '../../node_modules/bootstrap/scss/functions';
@import '../../node_modules/bootstrap/scss/variables';
@import '../../node_modules/bootstrap/scss/mixins';

#sharingbuttons {
	bottom: 0;
	display: flex;
	width: 100%;
	justify-content: center;
	position: fixed;
	left: 0;

	a {
		flex-grow: 1;
		text-align: center;
	}
}

@include media-breakpoint-up(md) {
	#sharingbuttons {
		flex-direction: column;
		height: 100vh;
		top: 0;
		width: auto;

		a {
			flex-grow: unset;
		}
	}
}

.resp-sharing-button__link,
.resp-sharing-button__icon {
	display: inline-block;
}

.resp-sharing-button__link {
	text-decoration: none;
	color: #fff;
}

.resp-sharing-button {
	transition: 25ms ease-out;
	padding: 0.25em 0.5em;
	font-family:
		Helvetica Neue,
		Helvetica,
		Arial,
		sans-serif;
}

@include media-breakpoint-up(md) {
	.resp-sharing-button {
		padding: 0.5em 0.75em;
	}
}

.resp-sharing-button__icon svg {
	width: 1em;
	height: 1em;
	margin-right: 0.4em;
	vertical-align: top;
}

.resp-sharing-button--small svg {
	margin: 0;
	vertical-align: middle;
}

/* Non solid icons get a stroke */
.resp-sharing-button__icon {
	stroke: #fff;
	fill: none;
}

/* Solid icons get a fill */
.resp-sharing-button__icon--solid,
.resp-sharing-button__icon--solidcircle {
	fill: #fff;
	stroke: none;
}

.resp-sharing-button--twitter {
	background-color: #55acee;
}

.resp-sharing-button--twitter:hover {
	background-color: #2795e9;
}

.resp-sharing-button--pinterest {
	background-color: #bd081c;
}

.resp-sharing-button--pinterest:hover {
	background-color: #8c0615;
}

.resp-sharing-button--facebook {
	background-color: #3b5998;
}

.resp-sharing-button--facebook:hover {
	background-color: #2d4373;
}

.resp-sharing-button--tumblr {
	background-color: #35465c;
}

.resp-sharing-button--tumblr:hover {
	background-color: #222d3c;
}

.resp-sharing-button--reddit {
	background-color: #5f99cf;
}

.resp-sharing-button--reddit:hover {
	background-color: #3a80c1;
}

.resp-sharing-button--google {
	background-color: #dd4b39;
}

.resp-sharing-button--google:hover {
	background-color: #c23321;
}

.resp-sharing-button--linkedin {
	background-color: #0077b5;
}

.resp-sharing-button--linkedin:hover {
	background-color: #046293;
}

.resp-sharing-button--email {
	background-color: #777;
}

.resp-sharing-button--email:hover {
	background-color: #5e5e5e;
}

.resp-sharing-button--xing {
	background-color: #1a7576;
}

.resp-sharing-button--xing:hover {
	background-color: #114c4c;
}

.resp-sharing-button--whatsapp {
	background-color: #25d366;
}

.resp-sharing-button--whatsapp:hover {
	background-color: #1da851;
}

.resp-sharing-button--hackernews {
	background-color: #ff6600;
}
.resp-sharing-button--hackernews:hover,
.resp-sharing-button--hackernews:focus {
	background-color: #fb6200;
}

.resp-sharing-button--vk {
	background-color: #507299;
}

.resp-sharing-button--vk:hover {
	background-color: #43648c;
}

.resp-sharing-button--facebook {
	background-color: #3b5998;
	border-color: #3b5998;
}

.resp-sharing-button--facebook:hover,
.resp-sharing-button--facebook:active {
	background-color: #2d4373;
	border-color: #2d4373;
}

.resp-sharing-button--twitter {
	background-color: #55acee;
	border-color: #55acee;
}

.resp-sharing-button--twitter:hover,
.resp-sharing-button--twitter:active {
	background-color: #2795e9;
	border-color: #2795e9;
}

.resp-sharing-button--email {
	background-color: #777777;
	border-color: #777777;
}

.resp-sharing-button--email:hover,
.resp-sharing-button--email:active {
	background-color: #5e5e5e;
	border-color: #5e5e5e;
}

.resp-sharing-button--linkedin {
	background-color: #0077b5;
	border-color: #0077b5;
}

.resp-sharing-button--linkedin:hover,
.resp-sharing-button--linkedin:active {
	background-color: #046293;
	border-color: #046293;
}
</style>
