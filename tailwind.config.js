/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: "none",
                        color: "inherit",
                        a: {
                            color: "var(--color-primary)",
                            "&:hover": {
                                color: "var(--color-secondary)",
                            },
                        },
                        code: {
                            color: "inherit",
                        },
                        pre: {
                            backgroundColor: "var(--color-background-dark)",
                            color: "white",
                        },
                        blockquote: {
                            borderLeftColor: "var(--color-primary)",
                            color: "inherit",
                        },
                    },
                },
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
    darkMode: "class",
};
