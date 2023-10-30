---
title: "Salutations, world!"
date: "March 23, 2023"

description: "Welcome to my website! Here's a little bit about how I built it."
tags: ["Frontend", "Astro"]
---

# Introduction

There comes a time in every (attempted) career academic's life when their affiliations exceeds the page limit of a default html page 12pt font. With my particular 

# Inspiration

My all-time favorite academic website is [Amy Ko's](https://faculty.washington.edu/ajko). It balances a nice aesthetic with a simple, easy-to-navigate design -- and it's open source! I am, however, a real tryhard, so I wanted to do everything I could myself.

Taking inspiration from [Cade Brown](https://cade.site/), I am using [Astro](https://astro.build/) to generate my site. Astro is a static site generator that uses [Svelte](https://svelte.dev/) components to build pages. It's a really cool project that I'm excited to use, and I am looking forward to see how it develops over time -- especially with the new [Client Side Routing](https://github.com/withastro/roadmap/pull/607) features (that I've yet to explore).

I've done a fair bit of work in parsing websites, and as cool as React and other compiled frontends are, I despise the DOMs that they generate. Sure, my browser in 2023 has no problem reading them, but the depth and complexity they produce, combined with the hashed ids and classes make me dubious of their maintainability -- especially as [frameworks come and go](https://v2.vuejs.org/lts/).

I want clean markdown that I can read and edit in a text editor, and I want to be able to easily parse it into a DOM that I can understand.

# Requirements

1. The site must be statically generated.
2. My posts must be able to be written in markdown.
3. Absolutely no JavaScript can required in the frontend.
4. The DOM needs to be human-comprehensible.
5. Collections of content must be easily created and maintained.
6. Everything needs to be <a href="https://en.wikipedia.org/wiki/Free_and_open-source_software">FOSS</a>.

# Stack

With all of these requirements considered, I am using the following stack:
1. [Astro](https://astro.build/) for static site generation
2. [Svelte](https://svelte.dev/) for component-based frontend development
3. [Sass](https://sass-lang.com/) for CSS preprocessing

For visuals, I'm comfortable with [Adobe Illustrator](https://www.adobe.com/products/illustrator.html) for what can be vectorized, [shaders](https://www.shadertoy.com/view/Ndc3zl) or [Adobe Photoshop](https://www.adobe.com/products/photoshop.html) for what cannot, and [Blender](https://www.blender.org/) for 3D modeling.

And of course, I'll be using my long-time favorite text editor, [Microsoft Word 2007](https://support.microsoft.com/en-us/office/install-office-2007-88a8e329-3335-4f82-abb2-ecea3e319657).

# Implementation

I've had a bare-bones version up for an embarassingly long time, but now, *I will actually start consistently writing content!* <sup><a href="https://xkcd.com/285/">[citation needed]</a></sup>.

In classic Gregory fashion, I will leave implementation details to add to this post later. But just imagine they're really cool and that you're super impressed.

[Check out my code here!](https://github.com/gcrois/gregory.croisdale)