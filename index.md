---
layout: toc
title: Index
regenerate: true
---

# {{ site.title }}

Welcome to {{ site.title }},
a technology, science, and philosophy blog for curious people
who want to understand and change the world.
In order to make you feel at home here as quickly as possible,
here is what you should know about this blog.

## Content

### Articles

{% assign articles = site.pages | where_exp: "article", "article.category" | where_exp: "article", "article.published" | sort: "published" | reverse %}
{% if articles.size > 0 %}
The following articles have been published on this blog:

{% for article in articles %}
* {{ article.published }}: [{% if article.icon %}<i class="fas fa-{{ article.icon }}"></i>{% endif %}{{ article.title }}]({{ article.url | relative_url }}){% endfor %}

{% else %}
No articles have been published so far.
Check again later
or subscribe to the mailing list at the bottom of this page to stay informed.
{% endif %}

### Categories

The topics on this blog fall into one of the following categories:

{% for category in site.data.categories %}
* <i class="fas fa-{{ category.icon }}"></i>{{ category.name }}: {{ category.description }}{% endfor %}

### Ambition

The goal of this website is to provide the best introduction available to the covered subjects.
After doing a lot of research about a particular topic,
I write the articles for my past self
in the hope they are useful to the present you.
Each article is intended to be the first one
that you should read about a given topic
and also the last
— unless you want to become a real expert on the subject matter.
I try to explain all concepts
as much as possible from [first principles](https://en.wikipedia.org/wiki/First_principle),
which means that you should need no prior knowledge
beyond a high school education.
If this is not the case for you,
please [let me know](#contact).

### Quality

As is the case for all humans,
my expertise is limited.
Given the wide range of topics I cover,
I cannot be an expert in all of them.
I try to check empirical facts and study normative statements as well as possible,
but unlike schools and [Wikipedia](https://en.wikipedia.org/wiki/Main_Page),
the content on this blog is intentionally opinionated.
If you don't like this,
then a different website is just a click away.
I believe that the judgement of theories
is just as important as the theories themselves
— given the right amount of intellectual humility
as opinions can and should evolve with new considerations.
The problem with learning is
that the more you understand,
the more you understand
what you don’t understand.
While going down the rabbit hole of a topic can be a lot of fun,
I have to stop my research at some point
in order not to paralyze myself.
Therefore, if I'm mistaken about facts,
please bring it to [my attention](#contact).
If you disagree with my conclusions,
then write a rebuttal.
If your rebuttal contributes to a civilized debate,
I will consider adding a link to it.
I strive to make my arguments free from
[logical fallacies](https://en.wikipedia.org/wiki/Formal_fallacy) and
[cognitive biases](https://en.wikipedia.org/wiki/Cognitive_bias),
but my rationality — unlike my curiosity — is also bounded.

### Length

In order to truly understand
why things are the way they are and not different,
you have to put in a lot of effort.
But as with many things in life,
the more you put into it,
the more you get out of it.
To respect your time,
I try to write as succinctly as I can,
which makes the information density really high.
However, complex concepts simply require a lot of words to explain them properly.
Anything that I cannot explain properly
because I don't understand it properly,
I omit from my articles.
If a topic or section does not interest you,
you should skip it rather than waste your time.
I put a lot of thought into the structure of the articles
to make the sections as easy to skim, skip, and digest as possible.

### License

<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">{{ site.title }}</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://www.kasparetter.com" property="cc:attributionName" rel="cc:attributionURL">Kaspar Etter</a> is licensed under the <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

### Liability

While I researched the content on this website thoroughly,
you take or omit actions based on it at your own risk.
In no event shall I as the author be liable
for any damages arising from advice on this website
or pages I linked to.

## Navigation

In order to make this blog as useful as possible,
I added the following features for you.
If you have ideas for improvement,
[tell me](#contact).

### Table of contents

The table of contents is generated to the left on bigger screens
and accessible through the button in the lower right corner on smaller screens.
It contains two levels of titles,
which are automatically expanded on bigger screens
and always expanded on smaller screens.
As the current section is highlighted,
you always know where you are,
which is crucial to grasp complex topics.

### Behavior of links

If you click on a green link, which references a different section on the same page,
a new entry in your browser history is generated
so that you can easily go back to where you were before you clicked the link.
A click on a blue link opens the referenced page in a new window or tab.
Like this, you never have to worry
that you lose your current position.
Let's just try it:
[Click here](#about)
and then back.

### Browser address

When you scroll through an article,
your browser address is updated continuously
in order to always link to the current section.
While this can create a lot of entries in your browser history,
it helps you find more easily where you left off,
especially on mobile,
where a page reload is forced upon you.
If you want to share an article
without linking to a particular section,
make sure to remove everything in the address from the hash onward.
Alternatively, simply scroll to the top of the page before copying the address.

### Link to section

If you want to share a link to a specific section,
just click on the green icon after the title
in order to copy the exact address to the clipboard of your device.
On devices with a mouse,
the green link icon is only shown
when you hover your mouse over the title.

### Skip a section

If a section does not interest you,
you can click on the text of its title
to advance to the next section of the same or a higher level.

### Change the style

If you prefer dark text on a white background,
you can toggle the style by clicking on the last entry of the navigation bar at the top.

## Contact

Do not hesitate to [contact me](mailto:contact@ef1p.com)
if you have feedback, questions or suggestions for topics to write about.
Please also let me know if an explanation is hard to follow.
If you found a typographical error, a factual inaccuracy or a logical fallacy,
you can also [create an issue](https://github.com/KasparEtter/ef1p/issues/new).

## Privacy

I use [Google Analytics](https://analytics.google.com) to track site visitors
and [Mailchimp](https://mailchimp.com) to manage the mailing list.
You can [configure your browser](https://tools.google.com/dlpage/gaoptout)
to deactivate the former and simply not use the latter.
The website is hosted with [GitHub Pages](https://pages.github.com),
which means that [Microsoft](https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/)
also learns when and from where this blog is being accessed.
Everything else that you enter on dynamic articles is only stored
[locally in your browser](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
If you don't trust me,
you can also [download](https://github.com/KasparEtter/ef1p) the website
and run it locally while being offline.

## About

My name is [Kaspar Etter](https://www.kasparetter.com)
and I'm a skeptic but curious person.
I studied computer science at [ETH](https://ethz.ch/en.html)
and live in Zurich, Switzerland.
