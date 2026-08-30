// Ambient module declarations for CSS side-effect imports (e.g. the Nativewind
// global stylesheet) and CSS Modules used by web-only components.

declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [className: string]: string };
  export default classes;
}
