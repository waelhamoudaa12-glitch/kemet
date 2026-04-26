import { subscribeToCategories, subscribeToStyles } from './src/lib/contentService';
subscribeToCategories((cats) => {
    console.log("Categories:", cats.length);
});
subscribeToStyles((styles) => {
    console.log("Styles:", styles.length);
});

setTimeout(() => {
    console.log("Exiting test.");
    process.exit(0);
}, 3000);
