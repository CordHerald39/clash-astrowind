import {defineConfig} from 'astro/config';
const supplied=process.env.SITE_URL;
const url=new URL(supplied||'http://localhost:4201');
const base=process.env.BASE_PATH||url.pathname;
export default defineConfig({site:url.origin,base,trailingSlash:'always',output:'static',vite:{}});
