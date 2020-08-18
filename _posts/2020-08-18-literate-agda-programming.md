---
layout: post
title: 'Literate Programming With Agda'
date: 2020-08-18 15:00:00 -0300
permalink: /blog/literate-programming-agda
author: Maycon Amaro
categories:
  - agda
---

Literate Programming is a way to explain something using natural language while giving some code blocks to complement. These codes can then be compiled like it was a traditional source code of the programming language. Let’s see how to do that with Agda!

## Requirements

Being extremely minimalist, we just need Agda’s compiler and any text editor. But we can explore some tools. Since you’re using Agda, I suppose you already have Emacs or Atom, and that can help a lot to check your code blocks while writing and with syntax highlighting for programming and markup languages. Also, we often use Literate Agda programming to write papers or posts (just like this one!), and to cover that I’m going to need a LaTeX compiler and a Markdown editor. For LaTeX, let’s use `pdflatex` and I suggest [MarkText](https://marktext.app/) as markdown editor. We’re going to use an [Unicode character table](https://unicode-table.com/pt/) and [Detexify](https://detexify.kirelabs.org/) to identify and get unicode and LaTeX codes. For writing LaTeX, there’s plenty of options. I personally like to use [Visual Studio Code](https://code.visualstudio.com/) with [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) plugin. Oh, we need and PDF reader and a browser too, but I strongly believe your Operating System already provides you these. All these tools are available for the three majors operating systems—I love some cross-platform. I’ll mention some files, you can get them in this [Google Drive’s folder]([Literate Agda - Google Drive](https://drive.google.com/drive/folders/1CfZ58dsN078vjtynUgezL-mmVOzdvvqI?usp=sharing)). 

## Agda + Markdown = Sweet and Simple

One thing I love about Markdown is that simplicity when marking content. In Design and Web patterns, we’re often wanting to split content from presentation, and to specify content’s hierarchy in a non-presentational way. HTML does it pretty well, but markdown has this much more lovely syntax—even though it won’t be enough for all our intents.

Marking code blocks in markdown is easy as three \`. There isn’t much secret, just write the content, put the code around three \` and let Agda do her work (yeah, I like to think Agda as *she*, [did you know she’s named after a hen?]([Hönan Agda (Agda The Chicken) by Cornelis Vresswijk - YouTube](https://www.youtube.com/watch?v=zPY42kkRADc))). Get the `AgdaMark.lagda.md` and compile using this command:

```bash
agda AgdaMark.lagda.md
```

And that’s it! If typechecking passes, you’re good to go. As I said before, Markdown is for marking content independently of the visual presentation. So there’s nothing Agda can do beyond this point. You can open the file and see that’s really no secret. Just remember that module’s name must be equal as the file name. You can use pandoc or kramdown if you want to convert this markdown to another format, but there’s better options, at least for the Agda part.

One more thing: if you misformat the code, Agda will take it as a natural language text and ignore it. If it happens that *all* code is misformatted, then Agda will trivially typecheck your code, and we don’t want that, so, just for the sake of testing, try inserting a proposital error and see if Agda will complain about it. If it does, then everything is really okay with the original file.

## Agda + HTML/CSS = Well… why not?

Websites with lots of Agda code isn’t something we see everyday. Even when we do, like this one, usually posts are written in Markdown and then converted to HTML using kramdown or a static web site generator—this one is using Jekyll, by the way. But knowledge is never too much, right?

HTML5 has its features to mark how things should be visually displayed, but this is totally against recent web standards. HTML is for marking content, structure, and CSS is for styling. Agda HTML backend is quite annoying since it’ll put its CSS automatically and then make *everything* as a `<pre>` in the process. So I’ll do different. Get `AgdaWeb.lagda` and open it. You’ll see it’s a nice structured HTML5 document with a plus `\begin{code} ... \end{code}`. We’ll tell Agda compiler to only mess with code stuff and let everything else in peace, that’s why I include its CSS myself, she’ll generate it anyway — but you can use another too (and that’s what I’d do).  Now command line work:

```bash
agda AgdaWeb.lagda --html --html-highlight=code
```

This will generate a folder **html** (you can provide the `--html-dir` if you want), and inside we’ll have the `.css` some `.html` and our beloved… `.tex`? If it happens, that’s okay, just change the extension to `.html` and you’re fine. If—for some reason—you want Agda to transform everything as a `<pre>` just remove `--html-highlight-code` option from the command. Now you changed the extension, just open the file with your favourite browser and see Agda colorful syntax. 

## Agda + LaTeX = The Super Combo

Here is where Literate Agda shine the brightest. Agda is specially used by computer **scientists** for several academic purposes (but not restricted to it). LaTeX is the standard for writing papers in Computer Science, and Agda fits very well with it. First, let’s see it in action. Take the file `List.Agda` (It’s in portuguese but don’t worry I’ll translate it soon) and go straight to command line:

```bash
agda List.lagda --latex
```

It’ll generate the folder **latex** (you can provide the `--latex-dir`) with your converted `.tex` file and a `agda.sty` if you don’t have one already. Then you can compile this with `pdflatex` to get your final pdf document. Let’s understand what is happenning with our `.lagda`.

First we have to include the agda package, so the code can be formatted and coloured:

```latex
\usepackage{agda}
```

You can also provide a theme name to it:

```latex
\usepackage[conor]{agda}
```

Conor is a theme inspired on Epigram traditional color pallete. If you use `xelatex` then is probably you won’t have problems with unicode. But `pdflatex` can struggle a bit. So, to avoid this, we explicitly declare the unicode characters:

```latex
\usepackage{newunicodechar}
...
\newunicodechar{symbol}{latex-equivalent}
```

We then write our LaTeX content and everytime we need Agda code we use

```latex
\begin{code}

\end{code}
```

and we can provide the optional argument `[hide]` to tell Agda to hide the piece of code from the document. This is specially useful if we don’t want to show every part of the code but we need all of them for succesfull typechecking. We also can use the Agda commands in the text, like `\AgdaPrimitiveType{Set} is an amazing type`. You can check [all the details about Agda LaTeX commands]([Generating LaTeX &mdash; Agda 2.6.1 documentation](https://agda.readthedocs.io/en/v2.6.1/tools/generating-latex.html)) on their documentation.

## Agda + Vim = undefined

Agda has good supported for Vim highlighted files, but I never needed or wanted to do it. At least I’m telling you it can be done, even though I can’t help you with it 😬.

## That’s all, folks!

Literate programming can be quite useful, I hope this article is useful to you. If you encounter any problems or have any suggestions, send it to maycon.amaro@aluno.ufop.edu.br . Have a good day!
