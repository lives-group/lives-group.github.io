---
layout: post
title: 'Creating DSLs with Racket - Part II'
date: 2020-11-09 15:00:00 -0300
permalink: /blog/creating-dsls-with-racket-part-II
author: Rodrigo Ribeiro
categories:
  - racket
  - DSLs
---


Introduction
------------

In the previous post, we started the implementation of a simple
language using Racket tools. In this post, we'll finish the 
implementation of our simple expression language and show 
how easy is to extend it with other features.

Each new feature inclusion is developed in a different branch. 
If want to see the "step-by-step" iteration of our tiny language
development, just follow take a look on each branch.

The complete code for this post can be found at the 
following
[link](https://github.com/lives-group/racket-dsl-tutorial).

Predecessor and IsZero operations
-----------------------------

We start the final implementation of our simple language by
including the predecessor and is-zero test operations. 
Instead of listing all code, we'll focus on the modification
on each module.

**Lexer modifications**

We need to include the tokens for predecessor and is-zero test 
on our lexer (file `lexer.rkt`) as follows:

```racket
(define basic-lexer
  (lexer-srcloc
   ["\n" (token lexeme #:skip? #t)]
   [whitespace (token lexeme #:skip? #t)]
   ["ZERO" (token lexeme 'ZERO)]
   ["SUCC" (token lexeme 'SUCC)] 
   ["PRED" (token lexeme 'PRED)] ; new rule
   ["ISZERO" (token lexeme 'ISZERO)] ; new rule
   ))
```

It is necessary to just include the tokens for these operations
and we are done. No change necessary on our tokenizer
implementation.

**Parser modifications**

After changing the lexer, we need to specify the syntax of
this operations in our expression language. We can do this 
by including two rules in the grammar as follows.

```racket
expr : ZERO
| SUCC @expr
| PRED @expr ; new rule
| ISZERO @expr ; new rule
| /"(" @expr /")"
```

And we are done with the needed modification in the syntax 
of our little language.

**Expander modifications**

The final piece of our changes is to update the expander to 
consider the predecessor and is-zero test operations. 


```racket
(define (eval e)
  (match e
    [(cons 'expr e1) (eval e1)]
    [(cons 'ZERO _)  0]
    [(cons 'SUCC e1) (add1 (eval e1))]
    [(cons 'PRED e1)
     (let ([r (eval e1)])
       (if (eq? r 0) 0 (sub1 r)))]
    [(cons 'ISZERO e1)
     (eq? (eval e1) 0)]))
```

The implementation is quite immediate. The only questionable 
point is that we follow Pierce's book specification which 
says that the predecessor of zero is zero itself.

These little modifications is all that is necessary to update
our expression language implementation. Next section, we discuss
the inclusion of a conditional operator.

Including a conditional operator
--------------------------------

In order to include a conditional operator in our language, we 
need to modify the parser and expander to acomodate this new 
feature. As in the previous section, we'll show all these 
modifications in each module.

**Lexer modifications**

In order to implement our conditional operator, we need to 
include the tokens for if, then and else as follows:

```racket
(define basic-lexer
  (lexer-srcloc
   ["\n" (token lexeme #:skip? #t)]
   [whitespace (token lexeme #:skip? #t)]
   ["ZERO" (token lexeme 'ZERO)]
   ["SUCC" (token lexeme 'SUCC)]
   ["PRED" (token lexeme 'PRED)]
   ["ISZERO" (token lexeme 'ISZERO)]
   ["IF" (token lexeme 'IF)]      ; new rule
   ["THEN" (token lexeme 'THEN)]  ; new rule 
   ["ELSE" (token lexeme 'ELSE)]  ; new rule
   [(:or "(" ")") (token lexeme lexeme)]))
```

And that's it! No need to change the tokenizer. Now, we 
need to change our language's grammar. 

**Parser modifications**

No suprises on the grammar rule for if-expressions. 
We use cut annotations to avoid the presence of the 
tokens "THEN" and "ELSE" in the parse-tree.

```racket
expr : ZERO
| SUCC @expr
| PRED @expr
| ISZERO @expr
| IF expr /THEN expr /ELSE expr
| /"(" @expr /")"
```

**Expander modifications**

The final piece of our implementation is to finish our language's
interpreter. In order to implement the equation for conditionals,
we use a let-expression to ensure that only one branch of if 
is evaluated based on its condition truth value.

```racket
(define (eval e)
  (match e
    [(cons 'expr e1) (eval e1)]
    [(cons 'ZERO _)  0]
    [(cons 'SUCC e1) (add1 (eval e1))]
    [(cons 'PRED e1)
     (let ([r (eval e1)])
       (if (eq? r 0) 0 (sub1 r)))]
    [(cons 'ISZERO e1)
     (eq? (eval e1) 0)]
    [(cons 'IF (cons e1 (cons e2 e3)))
     (let ([x (eval e1)])
       (if x (eval e2) (eval e3)))]))
```

Conclusion
----------

In this post, we finished the implementation of an expression 
language in Racket. The complete code for 
this post in available at the following
[source code repository](https://github.com/lives-group/racket-dsl-tutorial).

In the next post, I'll use the DSL Redex to specify the 
small-step reduction semantics and the type system of this
very same language and use them to check some meta-theory 
using property-based testing.
