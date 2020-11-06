---
layout: post
title: 'Creating DSLs with Racket - Part I'
date: 2020-08-18 15:00:00 -0300
permalink: /blog/creating-dsls-with-racket-part-I
author: Rodrigo Ribeiro
categories:
  - racket
  - DSLs
---

Introduction
------------

In our every day programming tasks we use software libraries
(or build new ones) to develop programs. However, some 
people argue that using a _general purpose programming language_
isn't always desirable. The argument is based on the fact
that using a language closer to application's domain
would enable an easier development of software tools.
This is the main argument behind the use of the so-called 
_domain-specific languages_, which are programming languages
carefully crafted to develop programs that solve problems
for a specific area.

However, while the idea of using DSLs seems promising, it has
a kind of _chicken-egg problem_: who will build the DSL compiler?
It is well known in computer science circles, that compiler 
construction is a kind of complex wizardry mastered only by few
chosen ones.

Given that, are we hopeless? No, by no means!
The [Racket programming language](https://racket-lang.org) allows
an easy way to construct a programming language implementation
using its _macro_ system.

In this post series, I'll implement a small expression language,
which is defined in Benjamin Pierce's book 
[Types and Programming Languages](https://www.amazon.com.br/Types-Programming-Languages-Benjamin-Pierce/dp/0262162091), using Racket. During these posts,
I'll build this tiny language using a step-by-step fashion: 
we'll start by natural numbers in Peano notation and, in latter
posts, more features will be included until we reach a complete
implementation of the expression language.

I assume a very basic functional programming knowledge and 
try to avoid, as much as possible, compiler construction related
terminology.

The complete code for this post can be found at the 
following [link](https://github.com/lives-group/racket-dsl-tutorial).

An Overview of Racket
---------------------

Racket is the current encarnation of Lisp, one of the most 
influential programming languages. The main distinction between
Racket and its ancestors is how the language was designed to 
support _language-oriented programming_, i.e., the systematic
design of DSLs to solve problems. The strategy used by Racket
to allow the definition of new languages is throught its 
expressive macro system and its _customizable_ parser. We can
enable such customizations using the `#lang` pragma, which 
is the first thing present in any Racket source program. The
pragma sets the initial bindings available and the syntax 
that can be used to define our code, i.e., it is just a fancy 
import definition.

A good introduction to Racket can be found [here](https://docs.racket-lang.org/quick/).

The Language Recipe
-------------------

In order to create a new programming language using Racket,
we should follow some steps. Before presenting them in a 
more practical (coding...) context, I'll sumarize them. In
what follows, we consider the task of creating a language 
called `fizzbuzz`.

1. Create a new project using the `raco` tool. Using the 
command line, type the following command to start a new 
Racket project.

```
raco new pkg fizzbuzz
```
Then we install the newly created project into raco package's
database as follows:

```
cd fizzbuzz
raco pkg install
```

2. Implement the language `boot` module. Inside the newly 
created directory `fizzbuzz`, you will find the file `main.rkt`.
This is the boot module of your language and it should provide
all functionality for your language implementation.

3. You need to implement a `read-syntax` function which 
translate the source-code of your language into Racket's 
S-expressions. The `read-syntax` function receive two 
arguments: a source name and a input port that points 
into this source of data. Finally, your `read-syntax`
should produce a Racket module expression and this module
must contain a reference to an expander which will provide 
the initial set of bindings to evaluate the code.

In essence, we need to make this steps to create a new language.
Next, we will apply this strategy to build a very simple 
language.

The Language Considered
-----------------------

In this first post, we'll build a language for natural numbers
in Peano notation which can be described by the following
simple context free grammar:

$$
\begin{array}{lcl}
   N & \to  & ZERO \\
     & \mid & SUCC\:\:N \\
     & \mid & (N)
\end{array}
$$

Using this syntax, we can write the number 3 as the following
term `SUCC(SUCC(SUCC ZERO))`. Our goal for this post is to 
implement a Racket language which allows us to write the 
following program:

```racket
#lang arith

SUCC (SUCC (SUCC ZERO))
```
which will evaluate to the number 3. The next section will 
follow the previous recipe to implement this simple task.

Implementing our Language
-------------------------

**Setting up the environment**

Our first steps will be creating and installing a 
new language project. In the command line, we will type 
the following commands:

```
raco pkg new arith
cd arith
raco pkg install brag
raco pkg install beautiful-racket-macro
```

The last two commands will install a library for creating 
parsers for Racket (`brag`) and some auxiliar macros to 
ease the task of syntax manipulation.

**Defining the source language parser**

In order to write numbers in Peano notation, we need to 
customize Racket's parser. We'll define the syntax for 
natural numbers using the `brag` Racket library.

The first step is to define the language's syntax. We do 
this using the `brag` language which is, essentially, a 
representation for context-free grammars.

```racket
#lang brag

expr : ZERO
| SUCC @expr
| /"(" @expr /")"
```

The main difference from plain context-free grammars are 
some annotations which are used by the parser algorithm to
produce the syntax tree. The first anotation is `@` which
denotes a _splice_ which will merge the elements of a node 
into the surrounding (parent) node. A _cut_ marking, `/`, 
removes a node from the resulting parsing tree.

In the previous grammar we use splices to remove the 
unnecessary occurrences of atom `expr` from the parse tree.
We use cuts to remove occurrences of parentesis from the 
result.

While this simple specification produces a parser for 
our rather simple language, it does not specify how 
_tokens_ of our language should be processed. We produce
tokens from the input text using a lexical analyser. 
The brag library has some utilities to ease the task of 
building lexers.

As in every lexical analyser, we do not consider whitespace 
and linebreaks. We specify this behaviour using the following
patterns in our lexer:

```racket
["\n" (token lexeme #:skip? #t)]
[whitespace (token lexeme #:skip? #t)]
```

Setting the flag `#:skip?` to true, the lexer will not pass this 
tokens to our parser. Next, we define that the lexer should produce
the atoms `'ZERO` and `'SUCC` as result of processing the strings
"ZERO" and "SUCC" as follows:

```racket
["ZERO" (token lexeme 'ZERO)]
["SUCC" (token lexeme 'SUCC)]
```
The last piece of our lexer is to process parentesis. The complete 
lexer code is as follows.

```racket
#lang racket

(require brag/support)

(define basic-lexer
  (lexer-srcloc
   ["\n" (token lexeme #:skip? #t)]
   [whitespace (token lexeme #:skip? #t)]
   ["ZERO" (token lexeme 'ZERO)]
   ["SUCC" (token lexeme 'SUCC)]
   [(:or "(" ")") (token lexeme lexeme)]))

(provide basic-lexer)
```

The final piece of our syntax analyser for our tiny language is 
to build a tokenizer, which simply calls the defined lexer on input.
We omit the tokenizer definition for brevity and it can be found 
on this post [source code repository](https://github.com/lives-group/racket-dsl-tutorial).

**Defining the expander**

The expander's main task is to convert the resulting tree of parsing into a Racket value.
For our simple example, we want to convert the parsing result into its corresponding 
numeric value.

As an example, consider again the example program previously presented:

```racket
#lang arith

SUCC (SUCC (SUCC ZERO))
```

Our parser will produce, as result, the following Racket data structure

```racket
'(expr 'SUCC 'SUCC 'SUCC 'ZERO)
```

which is a list composed by atoms. So our expander needs to compute a 
natural number from this list. The function `to-nat` generates the 
corresponding natural number by recursion.

```racket
(define (to-nat e)
  (match e
    [(cons 'expr e1) (to-nat e1)]
    [(cons 'ZERO _)  0]
    [(cons 'SUCC e1) (add1 (to-nat e1))]))
```

Having defined such a conversion function, we need to create a macro 
which will generate a Racket module for our code. The macro `arith-mb`
does this job.

```racket
(define-macro (arith-mb EXPR)
  #'(#%module-begin
     (to-nat 'EXPR)))
```

This macro receives the input parse tree as the `EXPR` parameter and it 
simply applies function `to-nat` and wrap the result in `#%module-begin`
form to create a Racket module containing the constant for the natural
number represented in the source code.

The final step in our expander is to provide our macro as the 
`#%module-begin` definition for our module. This will be used in 
the boot module to trigger macro expansion on the parsing result.
We also provide some _interposition points_ to allow using Racket 
REPL, application and constants using the following export definition.

```racket
(provide (rename-out [arith-mb #%module-begin])
         #%top-interaction
         #%top
         #%app
         #%datum)
```

**Implementing the boot module**

The last piece of our implementation is the boot module which
will glue the parser and expander to create our `arith` language.
We do this glueing by creating an appropriate `read-syntax` function.
The code of `read-syntax` is as follows:
```racket
(define (read-syntax path port)
  (define parse-tree
    (parse path
           (make-tokenizer port path)))
  (strip-context
   #`(module arith-mod arith/expander/expander
       #,parse-tree)))
```
The first step is to produce the parse tree for our code. We use a local
definition to produce the tree using function `parse` and the tokenizer
built. Using the parse tree, we construct a new module specifying the expander
in the module header definition using:

```racket
   #`(module arith-mod arith/expander/expander
       #,parse-tree))
```
Function `strip-context` removes the lexical information from the current syntatic
representation of the expanded program. 

This finishes the simple implementation of the first part of the expression language.


Conclusion
----------

In this post, we presented the implementation of a really simple (and boring...) language
in Racket. The complete code for this post in available at the following
[source code repository](https://github.com/lives-group/racket-dsl-tutorial).

In the next posts, we extend the language to include more constructs from Pierce's book
original definition.
