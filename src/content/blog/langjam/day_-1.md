---
title: "LangJam GameJam: Day -1"
image: "/images/blog/langjam-gamejam/-1.png"
date: "2025-12-13"
unlisted: true

description: "My plans for LangJam GameJam 2025: Creating a real Spreadsheet Game"
tags: ["Game", "Programming Languages", "LangJam GameJam"]
---

# LangJam GameJam 2025: Day -1

This year, I am joining [Austin Henley's Langjam Gamejam](https://langjamgamejam.com/), and creating a programming language, and a game _using_ that programming language, within one week (Dec 14th - Dec 20th).

If you have a familiarity with the development of games, engines, or programming languages, this might seem like a ridiculous task ([as some have expressed](https://itch.io/jam/langjamgamejam/topic/5599702/haha)) -- but I maintain optimism: I interpret the rules of this jam rather loosely, and also have come to respect the Domain-Specific Language as a (potentially) simple and powerful tool; creating notation to create a particular game is orders of magnitudes easier than writing a language for general purpose programming.

## Interpreting the Rules

One of my favorite games ever, [_Baba is You_](https://itch.io/jam/ngj17/rate/136556), was created for the 3-day [_2017 Nordic Game Jam_](https://itch.io/jam/ngj17). At first glance, one might dispute that _Baba is You_ fulfils our criteria, but any experienced Kiki will certainly have experience with the meta language _Baba is You_ is built around; the gameplay is entirely based on the ability to manipulate programs, and even some of the languages's semantics.

Does _Baba is You_ "create a language" and "use it"? In my mind, there is no doubt.

## My strategy

Like _Baba is You_, I hope to create a language whose tools actually comprise the game -- I want my IDE to be fun enough that you want to play with it.

Whereas _Baba is You_ is largely "turn-based", I want something more real-time, where speed and agility of manipulation are key.

## The Spreadsheet Genre

People will often refer to games that involve massive amounts of complicated data, like [_Europa Universalis_](https://store.steampowered.com/app/3450310/Europa_Universalis_V/), or [_Football Manager_](https://store.steampowered.com/app/3551340/Football_Manager_26/), as "spreadsheet games", but as a true spreadsheet enjoyer, I get a little offended.

To me, a lot of the fun of a spreadsheet is actually interacting with data in the grid format -- copy, pasting, dragging, and in a live environment like Google Sheets, fighting for the value of a cell.

There are even [_Excel World Championships_](https://www.youtube.com/watch?v=Si2dmLZJpSA)! With little-to-no overlap with Europa Universalis players...

I'm also inspired by several hours playing in cellular automata and tile-based physics games, like [_Game of Life_](https://playgameoflife.com/) and [_Powder Game_](https://dan-ball.jp/en/javagame/dust/). I think there's potential for some really interesting interactions between these experiences.

## Execution

I would really like to have an interactive spreadsheet experience done within the first 24 hours of the GameJam.

I want to use a Rust-based stack, with my primary target being WebAssembly. I will likely use [WGPU](https://github.com/gfx-rs/wgpu), but with the OpenGL Backend because Firefox is too busy implementing integrated Chatbots to add a stable or efficient WebGPU.

I want a clean, and opinionated data model -- I'll probably use a dense representation of the grid with an absolute limit; I'll excuse myself for this purity sin, as [I don't expect any major world governments relying on this for disease tracking...](https://blogs.city.ac.uk/cityshortcourses/2020/10/13/what-really-caused-the-excel-error-in-nhs-test-and-trace-covid-19-system-an-in-depth-technical-analysis/)

## Where the "fun" will come from

I love games that introduce simple mechanics, and scale them in unexpected ways. For example, the ability to manipulate the rules of _Baba is You_'s language inside of the language itself is a moment that added an entirely new dimension of creativity and fun to the game.

Some avenues I'd love to explore here:

1. Numbers -> AI Embedding (Text, Images, Motion?)
2. Get creative with rendering -- 3d?
3. Add physics -- gravity? collisions?
4. Have fun with portals!
5. Shortcuts + automation
6. Cell permissions, formatting
7. Controlling AI in a fun and live way (like my project, [DeckFlow](https://deckflow.org/), or my friend Shm's project, [DreamSheets](https://people.eecs.berkeley.edu/~bjoern/papers/almeda-dreamsheets-chi2024.pdf))

## The Game

I hope to update this blog post daily throughout my journey, with live links to playable prototypes. If you are interested in joining this GameJam, do it here: https://langjamgamejam.com! Make sure to join the Discord!
