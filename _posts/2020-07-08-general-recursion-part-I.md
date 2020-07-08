---
layout: post
title: 'General Recursion in Agda --- Part I'
date: 2020-07-08 15:00:00 -0300
permalink: /blog/general-recursion-part-I
author: Rodrigo Ribeiro
categories:
  - type theory
---

## Introduction

A very annoying issue that one faces when learning type theory based proof assistants like Coq
or Agda is  that all functions must be *total*, i.e., the pattern matching must be exaustive 
and it should always terminate. These languages use a *totality checker* to ensure these 
restrictions in all programs. However, due to the undecidability of the halting problem, there 
is no algorithm capable of deciding the totality of functions. So, there are terminating functions
which are not recognized as such by the totality checkers. 

You are probably asking: "why should we worry about termination?". Basically, we should not 
allow looping 
functions since they can be used to derive contradictions. So, in order to ensure the logical 
consistency of Agda as a logic, all functions should terminate in a finite number of steps. 

We will ilustrate the problem using Agda code. First, let's consider that is possible to define 
the following function:

```haskell
hell : ℕ → ⊥
hell n = hell n
```

In essence, passing a natural number to `hell`, we get a proof of `⊥`. Using the hell's 
definition, we can notice that all breaks loose, by using the elimination of false propositions.

```haskell
all-breaks-loose : ∀ {A : Set} → A
all-breaks-loose =  ⊥-elim (hell 0)
```

Thus, to ensure the uselfulness of our type theory, we must insist that all functions are total. 
This post will be the first of a series about techniques to define functions which 
terminate but are not recognized as such by the termination checkers.

The exemple we use to explain all techniques is merging two lists, a routine used by the 
merge-sort algorithm. The traditional version (in Haskell) of this algorithm is as follows:

```haskell
merge :: [a] -> [a] -> [a]
merge [] ys = ys
merge xs [] = xs
merge (x : xs) (y : ys) 
   | x <= y = x : merge x (y : ys)
   | otherwise = y : merge (x : xs) ys
```

In the next section, we will describe how to implement it using bounded recursion.

## Bounded recursion

A simple technique to ensure termination of recursive programs is to bound the number of allowed 
recursive calls. We can limit the number of calls by adding an extra parameter 
to the functions definition which denotes that limit. Next, we show an implementation of 
`merge` algorithm using bounded recursion.

```haskell
merge-bounded : ℕ → List ℕ → List ℕ → Maybe (List ℕ)
merge-bounded zero _ _ = nothing
merge-bounded (suc n) [] ys = just ys
merge-bounded (suc n) xs [] = just xs
merge-bounded (suc n) (x ∷ xs) (y ∷ ys) with x <? y
...| yes p = merge-bounded n xs (y ∷ ys) >>= λ zs → just (x ∷ zs)
...| no  q = merge-bounded n (x ∷ xs) ys >>= λ zs → just (y ∷ zs)
```

We include, as the first parameter, a natural number value which is used to limit the 
number of recursive calls. The result type of function `merge-bounded` uses type `Maybe`,
returning constructor `nothing` when the function does more recursive calls than the maximum
allowed value provided as first argument. Also, we use the monadic behavior of computations on
the `Maybe` type to avoid excessive pattern-matchings which are hidden within the monadic _bind_ 
function.

While having a simple definition, the use of bounded recursion has some drawbacks: 
1) It is not always easy to determine how much “fuel” is needed to calculate the 
complete result of a function. For the merge example, we can provide
`1 + length xs + length ys` as input, since this function performs a number 
of steps proportional to the size of the two lists. 2) Another drawback is 
that the fuel parameter is preserved during compilation, which can impact on 
code performance.

While the performance issue doesn't have a simple solution (it depends on how the Agda's compiler
pipeline is implemented), we can provide a guarantee of what is the mininum number of steps 
demanded by `merge-bound` to return a `just` value. The next theorem shows that any value greater
or equal to `1 + length xs + length ys` is sufficient. 

```haskell
merge-enough : ∀ m (xs ys : List ℕ) →
                 m ≥ (1 + length (xs ++ ys)) →
                 ∃ (λ zs → merge-bounded m xs ys ≡ just zs)
  merge-enough (suc m) [] ys gt = ys , refl
  merge-enough (suc m) (x ∷ xs) [] gt = x ∷ xs , refl
  merge-enough (suc m) (x ∷ xs) (y ∷ ys) gt with x <? y
  ...| yes p with merge-enough m xs (y ∷ ys) (≥-inv gt)
  ...   | zs , eq  rewrite eq = x ∷ zs , refl
  merge-enough (suc m) (x ∷ xs) (y ∷ ys) gt | no  p 
     with merge-enough m (x ∷ xs) ys (lemma {m}{y}{xs}{ys} gt)
  ...| zs , eq rewrite eq = y ∷ zs , refl
```

## Conclusion

In this post, we dicussed why it is necessary to ensure totality for all Agda functions. We also
have presented a simple technique to guarantee termination which is the use of bounded-recursion.
The code used in this post is available at the following 
[repository](https://github.com/lives-group/general-recursion).

In the next post, I will discuss another technique: well-founded recursion.
