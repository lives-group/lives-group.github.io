---
layout: post
title: 'General Recursion in Agda — Part III'
date: 2020-07-08 15:00:00 -0300
permalink: /blog/general-recursion-part-III
author: Rodrigo Ribeiro
categories:
  - type theory
---

## Introduction

This is the third post in our series about techniques for defining recursive functions in Agda. 
The first two posts presented bounded and well-founded recursion, respectively. In this post,
we describe a variant of well-founded recursion known as the Bove-Capretta method, which received 
this name because of its creators (Ana Bove and Venanzio Capretta).

## The Bove-Capretta Method

The so-called Bove-Capretta method consists in defining an inductive special-purpose accessibility predicate 
that characterises the inputs on which the algorithm terminates. Using this predicate, we can 
define the algorithm by structural recursion on the proof that the input values satisfy this 
predicate. Then, we can separately prove that all possible inputs satisfy the defined predicate. By 
combining both results, we can produce a version of the algorithm which does not mention 
the specially crafted predicate.

Intuitively, the predicate should mimic function recursive structure by producing a proof for a complete 
input from proofs from the arguments of the recursive calls. According to the authors of the method, 
the predicate should follow the defined function call graph. The custom predicate for function merge is 
as follows:

```haskell 
data _⊏_ : List ℕ → List ℕ → Set where
  ⊏-1 : ∀ {xs} → xs ⊏ []
  ⊏-2 : ∀ {ys} → [] ⊏ ys
  ⊏-3 : ∀ {x y xs ys} → x < y → xs ⊏ (y ∷ ys) → (x ∷ xs) ⊏ (y ∷ ys)
  ⊏-4 : ∀ {x y xs ys} → x ≥ y → (x ∷ xs) ⊏ ys → (x ∷ xs) ⊏ (y ∷ ys)
```

Note that the two first constructors correspond to the base cases of merge function (when one of the input lists is empty).
The third and fourth constructor correspond to the recursive calls for merge. The third requires a proof that `x < y` and 
a predicate proof for `xs` and `y ∷ ys`, which are the lists passed to the recursive call of function merge. The fourth
constructor definition follows the same idea.

Using the predicate, we can easily define the merge function as follows:

```haskell
  merge' : (xs ys : List ℕ) → xs ⊏ ys → List ℕ
  merge' xs .[] ⊏-1 = xs
  merge' .[] ys ⊏-2 = ys
  merge' .(_ ∷ _) .(_ ∷ _) (⊏-3 {x}{y}{xs}{ys} x<y q) 
     = x ∷ merge' xs (y ∷ ys) q
  merge' .(_ ∷ _) .(_ ∷ _) (⊏-4 {x}{y}{xs}{ys} y≥x q) 
     = y ∷ merge' (x ∷ xs) ys q
```

After the definition of `merge'` by recursion on the predicate, we need to show that it holds for all pairs of lists.
We can do this by well-founded recursion on list's size as follows:

```haskell
⊏-all : (xs ys : List ℕ) → xs ⊏ ys
⊏-all xs ys = wfRec _<*_ 
                    merge-wf 
                    (λ p → proj₁ p ⊏ proj₂ p) 
                    step 
                    (xs , ys)
  where
    open MergeWF ℕ
    step : ∀ (p : List ℕ × List ℕ) →
           (∀ y → y <* p → proj₁ y ⊏ proj₂ y) →
           proj₁ p ⊏ proj₂ p
    step ([] , ys) IH = ⊏-2
    step (x ∷ xs , []) IH = ⊏-1
    step (x ∷ xs , y ∷ ys) IH with total x y
    ...| inj₁ p 
      = ⊏-3 p (IH (xs , y ∷ ys) 
                  (Lexicographic.left Nat-WF.<'-base))
    ...| inj₂ q 
      = ⊏-4 q (IH (x ∷ xs , ys) 
                  (Lexicographic.right Nat-WF.<'-base))
```

Now, we can finally have our `merge` function with a type that do not mention the predicate by combining
the two previous functions.

```haskell
merge : List ℕ → List ℕ → List ℕ
merge xs ys 
   = merge' xs ys (⊏-all xs ys)
```

## Conclusion

In this post we briefly presented the Bove-Capretta method for defining general recursive functions by 
applying it in our `merge` example. For more information about the method we refer to its original publication
which is available [here](http://www.cs.nott.ac.uk/~pszvc/publications/General_Recursion_MSCS_2005.pdf).

The code used in this post is available at the following 
[repository](https://github.com/lives-group/general-recursion).

In the next post of the series, I'll discuss the use of sized types for defining general recursive functions.
