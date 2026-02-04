const mobileNav = document.querySelector("#hamburger-nav");

if (mobileNav) {
    const toggleButton = mobileNav.querySelector(".mobile-nav__toggle");
    const overlay = mobileNav.querySelector(".mobile-nav__overlay");
    const menu = mobileNav.querySelector(".mobile-nav__menu");
    const menuLinks = menu ? Array.from(menu.querySelectorAll(".mobile-nav__link")) : [];
    let isMenuOpen = false;

    if (menu) {
        menu.setAttribute("aria-hidden", "true");
    }

    const focusFirstLink = () => {
        if (! menuLinks.length) {
            toggleButton ?. focus({preventScroll: true});
            return;
        }

        const firstLink = menuLinks[0];
        if (firstLink) {
            firstLink.focus({preventScroll: true});
        }
    };

    const openMenu = () => {
        if (! toggleButton || ! overlay || ! menu || isMenuOpen) {
            return;
        }

        isMenuOpen = true;
        overlay.hidden = false;
        menu.setAttribute("aria-hidden", "false");
        toggleButton.setAttribute("aria-expanded", "true");

        window.requestAnimationFrame(() => {
            mobileNav.classList.add("mobile-nav--open");
        });

        window.setTimeout(focusFirstLink, 360);
    };

    const closeMenu = ({
        restoreFocus = true
    } = {}) => {
        if (! toggleButton || ! overlay || ! menu || ! isMenuOpen) {
            return;
        }

        isMenuOpen = false;
        toggleButton.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        mobileNav.classList.remove("mobile-nav--open");

        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                toggleButton.focus({preventScroll: true});
            });
        }
    };

    const handleOverlayTransitionEnd = (event) => {
        if (! overlay || event.target !== overlay || event.propertyName !== "opacity") {
            return;
        }

        if (! isMenuOpen) {
            overlay.hidden = true;
        }
    };

    toggleButton ?. addEventListener("click", () => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay ?. addEventListener("transitionend", handleOverlayTransitionEnd);

    overlay ?. addEventListener("pointerdown", (event) => {
        if (! menu) {
            return;
        }

        if (! menu.contains(event.target)) {
            closeMenu();
        }
    });

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu({restoreFocus: false});
        });
    });

    document.addEventListener("keydown", (event) => {
        if (! isMenuOpen) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
            return;
        }

        if (event.key === "Tab") {
            const focusTargets = menuLinks.length ? [
                ... menuLinks,
                toggleButton
            ].filter(Boolean) : [toggleButton];
            if (! focusTargets.length) {
                return;
            }

            const firstElement = focusTargets[0];
            const lastElement = focusTargets[focusTargets.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey) {
                if (activeElement === firstElement) {
                    event.preventDefault();
                    lastElement ?. focus({preventScroll: true});
                }
            } else if (activeElement === lastElement) {
                event.preventDefault();
                firstElement ?. focus({preventScroll: true});
            }
        }
    });
}


const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");
const themeStorageKey = "preferred-color-scheme";
const prefersDarkScheme = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

const getStoredTheme = () => {
    try {
        return localStorage.getItem(themeStorageKey);
    } catch (error) {
        return null;
    }
};

const updateToggleButtons = (theme) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    themeToggleButtons.forEach((button) => {
        button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        button.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
        const icon = button.querySelector(".theme-toggle__icon");
        const text = button.querySelector(".theme-toggle__text");
        if (icon) {
            icon.textContent = theme === "dark" ? "☀️" : "🌙";
        }
        if (text) {
            text.textContent = `${
                nextTheme.charAt(0).toUpperCase()
            }${
                nextTheme.slice(1)
            } mode`;
        }
    });
};

const applyTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-theme", isDark);
    updateToggleButtons(theme);
};

let storedPreference = getStoredTheme();
const initialTheme = storedPreference || (prefersDarkScheme && prefersDarkScheme.matches ? "dark" : "light");

applyTheme(initialTheme);

themeToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
        storedPreference = newTheme;
        applyTheme(newTheme);
        try {
            localStorage.setItem(themeStorageKey, newTheme);
        } catch (error) {
            storedPreference = null;
        }
    });
});

if (prefersDarkScheme) {
    const handleSystemThemeChange = (event) => {
        if (storedPreference === null) {
            applyTheme(event.matches ? "dark" : "light");
        }
    };

    if (typeof prefersDarkScheme.addEventListener === "function") {
        prefersDarkScheme.addEventListener("change", handleSystemThemeChange);
    } else if (typeof prefersDarkScheme.addListener === "function") {
        prefersDarkScheme.addListener(handleSystemThemeChange);
    }
}


const reduceMotionQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

const ROLLING_DELAY_STEP = 0.015;
const ROLLING_INTRO_DELAY = 600;

const heroTitle = document.querySelector(".hero-title");

if (heroTitle && ! heroTitle.dataset.rollingProcessed) {
    const originalText = heroTitle.textContent.trim();

    if (originalText.length > 0) {
        const characters = Array.from(originalText);

        const createBlock = () => {
            const block = document.createElement("span");
            block.classList.add("rolling-text__block");
            block.setAttribute("aria-hidden", "true");

            characters.forEach((character, index) => {
                const letter = document.createElement("span");
                letter.classList.add("rolling-text__letter");
                letter.textContent = character === " " ? "\u00a0" : character;
                letter.dataset.letterIndex = String(index);
                block.appendChild(letter);
            });

            return block;
        };

        heroTitle.classList.add("rolling-text");
        heroTitle.setAttribute("aria-label", originalText);
        heroTitle.textContent = "";
        heroTitle.dataset.rollingProcessed = "true";

        const primaryBlock = createBlock();
        const secondaryBlock = createBlock();

        heroTitle.append(primaryBlock, secondaryBlock);

        const letterNodes = heroTitle.querySelectorAll(".rolling-text__letter");

        const applyMotionPreferences = (shouldReduce) => {
            heroTitle.classList.toggle("rolling-text--static", shouldReduce);

            letterNodes.forEach((letter) => {
                if (shouldReduce) {
                    letter.style.transitionDuration = "0s";
                    letter.style.transitionDelay = "0s";
                } else {
                    const index = Number.parseInt(letter.dataset.letterIndex ?? "0", 10) || 0;
                    letter.style.transitionDuration = "var(--hero-rolling-duration)";
                    letter.style.transitionDelay = `${
                        index * ROLLING_DELAY_STEP
                    }s`;
                }
            });

            if (shouldReduce) {
                heroTitle.classList.remove("play");
            }
        };

        const initializeAnimation = () => {
            if (reduceMotionQuery && reduceMotionQuery.matches) {
                applyMotionPreferences(true);
                return;
            }

            applyMotionPreferences(false);

            const activateIntro = () => {
                heroTitle.classList.add("play");
            };

            window.setTimeout(activateIntro, ROLLING_INTRO_DELAY);

            const cancelIntro = () => {
                heroTitle.classList.remove("play");
            };

            heroTitle.addEventListener("pointerenter", cancelIntro);
            heroTitle.addEventListener("pointerdown", cancelIntro);
            heroTitle.addEventListener("focusin", cancelIntro);
        };

        initializeAnimation();

        if (reduceMotionQuery) {
            const handleMotionPreferenceChange = (event) => {
                const shouldReduce = event.matches;
                applyMotionPreferences(shouldReduce);
                if (! shouldReduce) {
                    window.requestAnimationFrame(() => {
                        window.setTimeout(() => {
                            heroTitle.classList.add("play");
                        }, ROLLING_INTRO_DELAY);
                    });
                }
            };

            if (typeof reduceMotionQuery.addEventListener === "function") {
                reduceMotionQuery.addEventListener("change", handleMotionPreferenceChange);
            } else if (typeof reduceMotionQuery.addListener === "function") {
                reduceMotionQuery.addListener(handleMotionPreferenceChange);
            }
        }
    }
}
