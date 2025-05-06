// Модульная декларация TypeScript для импорта CSS/SCSS-модулей

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}