---
layout: toc
title: Explained from First Principles
permalink: /index.html
author: Kaspar Etter
license: CC BY 4.0
regenerate: true
---

# {{ site.title }}

Welcome to {{ site.title }},
a technology, science, and philosophy blog for curious people
who want to understand and change the world.
In order to make you feel at home here as quickly as possible,
here is what you should know about this blog.

<figure markdown="block">
{% include_relative generated/focus.embedded.svg %}
<figcaption markdown="span">
This blog explains technical concepts and scientific theories.
</figcaption>
</figure>


## Content


### Articles

The following articles have been published on this blog:

{% assign articles = site.pages | where_exp: "article", "article.category" | where_exp: "article", "article.published" | sort: "published" | reverse %}
<div class="custom-row">
{% for article in articles %}
  <div class="custom-column">
    <a class="custom-card" href="{{ article.url | relative_url }}">
      <div class="custom-card-image">

{% include_relative {{ article.name | replace: ".md", ".svg" | prepend: "thumbnails/" }} %}
      </div>
      <div class="custom-card-title">{{ article.title }}</div>
      <div class="custom-card-text">{{ article.teaser }}</div>
      <div class="custom-card-date">{{ article.published | date: site.date_format }}</div>
    </a>
  </div>
{% endfor %}
</div>


### Ambition

The goal of this website is to provide the best introductions available to the covered subjects.
After doing a lot of research about a particular topic,
I write the articles for my past self in the hope they are useful to the present you.
Each article is intended to be the first one that you should read about a given topic
and also the last — unless you want to become a real expert on the subject matter.
I try to explain all concepts as much as possible from [first principles](https://en.wikipedia.org/wiki/First_principle),
with which I mean the following:
- [**Reductionist reasoning**](https://en.wikipedia.org/wiki/Reductionism):
  There is a big difference between understanding *how* something works and understanding *why* something works.
  The latter is much more interesting as it allows you to predict how a system behaves in novel circumstances.
- **No prior knowledge required**:
  I strive to make the explanations comprehensible with no prior knowledge beyond a high-school education.
  Since education varies a lot by school and country,
  I link even basic concepts to external sources,
  such as [Wikipedia](https://en.wikipedia.org/).
- [**Reasoning transparency**](https://www.openphilanthropy.org/research/reasoning-transparency/):
  By referencing the sources behind empirical claims and by giving you the full explanation whenever possible,
  you can form your own opinion without having to trust me.
  The articles themselves are [minimal-trust investigations](https://www.cold-takes.com/minimal-trust-investigations/).


### Quality

As is the case for all humans,
my expertise is limited.
Given the wide range of topics I cover,
I cannot be an expert in all of them.
I try to check empirical claims and study normative statements as well as I can,
but unlike schools and [Wikipedia](https://en.wikipedia.org/),
the content on this blog is intentionally opinionated.
I believe that the judgment of an approach is just as important as the approach itself,
given the right amount of intellectual humility as opinions can and should evolve with new considerations.
The problem with learning is that the more you understand,
the more you understand what you don’t understand.
While going down the rabbit hole of a topic can be a lot of fun,
I have to stop my research at some point in order not to paralyze myself.
Therefore, if I'm mistaken about facts,
please bring it to [my attention](#contact).
If you disagree with my conclusions, write a rebuttal.
If your rebuttal contributes to a civilized debate, I'll link to it.


### Length

In order to truly understand why things are the way they are and not different,
you have to put in a lot of effort.
But as with many things in life,
the more you put into it,
the more you get out of it.
To respect your time,
I write as succinctly as I can,
which makes the information density of my texts really high.
However, complex concepts simply require a lot of words to explain them properly.
I put a lot of thought into the structure of each article
to make it as easy to skim and digest as possible.
I avoid overarching storylines so that you can read each section independently,
which allows the articles to be used as [works of reference](https://en.wikipedia.org/wiki/Reference_work).


### License

<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">{{ site.title }}</span>
by <a xmlns:cc="http://creativecommons.org/ns#" href="https://kasparetter.com" property="cc:attributionName" rel="cc:attributionURL">Kaspar Etter</a>
is licensed under the <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.


### Disclaimer

While I researched the content on this website thoroughly,
you take or omit actions based on it at your own risk.
In no event shall I as the author be liable
for any damages arising from information or advice
on this website or on referenced websites.


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
Like this, you never have to worry that you lose your current position.
Let's just try it:
[Click here](#about) and then back.


### Browser address

When you scroll through an article,
your browser address is updated continuously
in order to always link to the current section.
While this can create a lot of entries in your browser history,
it helps you find more easily where you left off,
especially on mobile when a page reload is forced upon you.
If you want to share an article without linking to a particular section,
make sure to remove everything in the address from the [hash (#)](https://en.wikipedia.org/wiki/Number_sign) onward.
Alternatively, simply scroll to the top of the page before copying the address.


### Section links

If you want to share a link to a specific section,
just click on the green icon after the title
in order to copy the exact address to the clipboard of your device.
On devices with a mouse,
the green link icon is shown only
when you hover your mouse over the title.


### Section skipping

If a section does not interest you,
you can click on the text of its title
to advance to the next section of the same or a higher level.


### Information boxes

Articles contain boxes with additional information,
which you can open and close by clicking on their title.
If you want to expand all boxes,
you can click on "Expand" in the navigation bar.
This is useful for including all boxes
when searching for a phrase on a page.

<details markdown="block" open>
<summary markdown="span" id="recommended-reading">
Recommended reading
</summary>

Boxes which start out open contain explanations
that are important to follow the main narrative.
Their content doesn't fit the structure of the article
or is self-contained enough to warrant its own box.
In either case, the article may refer to such boxes.

</details>

<details markdown="block">
<summary markdown="span" id="optional-reading">
Optional reading
</summary>

Boxes which start out closed contain side notes
that can be skipped without impairing the main topic.
Sometimes I just like to digress.
Other times,
such boxes contain background information
which is too technical for a general audience.
In either case,
you might miss out on interesting little details
if you don't open them.
However, if an article already feels too long or advanced to you,
I suggest that you simply skip all closed boxes
when you read the article for the first time.

</details>


### Dark and light mode

You can switch from a dark appearance to a light appearance by clicking on the second-last entry in the navigation bar at the top.


### Interactive tools

Many articles contain interactive tools,
which allow you to play around with a particular concept.
In order to revisit earlier examples later on,
the values you enter are stored
[locally in your browser](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
You can go back and forth through the history of values by clicking on the corresponding buttons.
The values are persisted across sessions:
If you close the browser window and then open the article again,
the entered values are still there.
You can erase the history of a tool by clicking the button with the trash icon.
If you don't want the entered values to be persisted across sessions in the first place,
then open the article in the [private mode](https://en.wikipedia.org/wiki/Private_browsing) of your web browser.
You can also <a id="erase-all-values">erase all stored values</a>,
including your [theme preference](#dark-and-light-mode),
by clicking on the pink link in this sentence.


### Sharing of values

You can share a [tool](#interactive-tools)'s current set of values with someone else by clicking on the corresponding button.
The values are encoded into the [fragment](https://en.wikipedia.org/wiki/URI_fragment) of the copied link.
This has the advantage that they are not sent to the server when opening the link.
On the downside, such links don't work for users who disabled [JavaScript](https://en.wikipedia.org/wiki/JavaScript).


### Article download

You can download each article as a PDF for printing or offline reading.
You find the download link at the top of the corresponding article.
The printing feature of your browser also works, of course,
but I cannot ensure that the article is formatted nicely this way.
Additionally, only the open [information boxes](#information-boxes) are printed
if you export the article yourself.


### Graphics export

By right-clicking a graphic with your mouse
(or by double-clicking it on a touch device),
you can download the graphic
as a pixel image in the PNG format
or as a vector graphic in the SVG format.
You can use the graphics on this blog for anything you want
as long as you give appropriate credit,
indicate if you made changes,
and don't suggest that I endorse you
(see the [license](#license) above).


### Acronym tooltips

While I generally try to avoid acronyms,
sometimes they're better known than what they stand for.
Whenever you encounter an acronym on this website,
you can hover with your mouse over it
(or click on it on a touch device)
to get a [tooltip](https://en.wikipedia.org/wiki/Tooltip) with their full name.


## Transparency

I work independently, and I'm supported only by donations from my readers.
I pledge to disclose all conflicts of interest which might bias the content on this blog.
All the text on this website is written by me and not by a
[large language model (LLM)](https://en.wikipedia.org/wiki/Language_model#Notable_language_models),
such as [ChatGPT](https://openai.com/blog/chatgpt).


## Contact

Do not hesitate to [contact me](mailto:contact@ef1p.com)
if you have feedback, questions, or suggestions for topics to write about.
Please also let me know if an explanation is hard to follow.
If you found a typographical error, a factual inaccuracy or a logical fallacy,
you can also [create an issue](https://github.com/KasparEtter/ef1p/issues/new).


## Donate

It already means a lot to me if you read and share my articles.
If you have a regular income and learned something from my articles,
I would really appreciate your financial support.
You can support me on
[GitHub](https://github.com/sponsors/KasparEtter),
[Liberapay](https://liberapay.com/ef1p/),
[Patreon](https://www.patreon.com/ef1p),
and [PayPal](https://paypal.me/KasparEtter).
You can also transfer money directly to my bank account
using [my name](#about) and the IBAN `CH48 0025 7257 6106 9840 Q`.
If you prefer to stay "anonymous", you can donate some bitcoin to
`bc1q4fsulplawjucrw9sz0swgu6thgk24fn03wttrrcesut2nsq0zwgsepveep`
[<i class="fas fa-external-link-alt smaller"></i>](https://blockstream.info/address/bc1q4fsulplawjucrw9sz0swgu6thgk24fn03wttrrcesut2nsq0zwgsepveep).
Every [satoshi](https://en.wikipedia.org/wiki/Bitcoin#Units_and_divisibility) counts.


## Privacy

- I use [Plausible Analytics](https://plausible.io/) to measure how people interact with this website. Plausible Analytics
  collects [no personal information](https://plausible.io/privacy-focused-web-analytics#no-personal-data-is-collected),
  uses [no cookies](https://plausible.io/privacy-focused-web-analytics#no-cookies-and-other-persistent-identifiers), and
  isolates all data [to a single day](https://plausible.io/privacy-focused-web-analytics#all-data-is-isolated-to-a-single-day).
  In order to be as transparent as possible,
  I'm sharing [my analytics](https://plausible.io/explained-from-first-principles.com) with you.
- This site is hosted with [GitHub Pages](https://pages.github.com),
  which means that [Microsoft](https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/)
  also learns when and from where this blog is being accessed.
- Some [interactive tools](#interactive-tools) send personal information to other companies when you click on them.
  For the ones that do, this fact is stated in the paragraph before the tool.
  If nothing is stated there, the values you enter are stored only
  [locally in your browser](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
- I announce new articles on [Reddit]({{ site.reddit_community }}),
  [Twitter](https://twitter.com/{{ site.twitter_handle }}),
  and [Telegram]({{ site.telegram_channel }}).
  If you don't like these companies, then just don't use their services.


## About

My name is [Kaspar Etter](https://kasparetter.com).
I'm a curious and skeptical person.
I studied computer science at [ETH](https://ethz.ch/en.html) and live in Zurich, Switzerland.


## FAQ

Here are my answers to [frequently asked questions (FAQ)](https://en.wikipedia.org/wiki/FAQ):


### Do you also have a mailing list? {#mailing-list}
{:data-toc-text="Mailing list"}

No.
I don't like the pricing models of the major mailing list providers, the double opt-in hassle due to the European
[General Data Protection Regulation (GDPR)](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation),
and anti-spam regulations requiring me to disclose my physical address,
so I opted for a [Telegram channel]({{ site.telegram_channel }}) instead.
You can also activate notifications on this blog's [Twitter profile](https://twitter.com/{{ site.twitter_handle }})
or subscribe to its [news feed]({% link feed.xml %})
using [RSS/Atom](https://support.mozilla.org/en-US/kb/how-subscribe-news-feeds-and-blogs).
I intend to use these channels exclusively to announce new content,
which means that you don't have to worry about noise.


### Can't you write shorter articles? {#article-length}
{:data-toc-text="Article length"}

I guess I could,
but I also believe that length is the [wrong metric](https://en.wikipedia.org/wiki/Attribute_substitution).
Whether a text is worth reading should be judged by the number of insights per word and not by the number of words.
Your opinion may vary, but I think I'm doing pretty well on this second metric.


### Why don't you split your long articles into smaller ones? {#article-splitting}
{:data-toc-text="Article splitting"}

In my opinion, scrolling is easier than clicking,
especially when you just want to skim a text.
Having everything on a single page is also friendlier for offline reading
and for using your browser's search functionality to find what you're looking for.
The biggest reason for splitting long articles into smaller ones is
[search engine optimization (SEO)](https://en.wikipedia.org/wiki/Search_engine_optimization).
It would also have the desirable side effect of allowing me to post new content more often.
For now, I'm willing to sacrifice both in favor of making my content as useful as possible,
but my view on this might change in the future.


### Have you considered creating videos about your content? {#video-format}
{:data-toc-text="Video format"}

Yes, I have, but I think it's neither a good fit for me nor for my content.
I like [edutainment](https://en.wikipedia.org/wiki/Educational_entertainment) a lot,
and there are many great channels on [YouTube](https://www.youtube.com/), which I watch often.
However, written text has many advantages when you truly want to understand something:
You can read at your own pace,
reread a paragraph as needed,
recognize the structure of an argument,
copy sentences into your notes,
and search for terms of interest.
In comparison to videos,
text is also much easier to make interactive
and to update after its publication.
Last but not least, the [World Wide Web (WWW)](https://en.wikipedia.org/wiki/World_Wide_Web)
allows me to link to additional explanations and to the sources of my information.


### Have you considered publishing your articles as books? {#book-format}
{:data-toc-text="Book format"}

Not really.
I think that books are an outdated format for most purposes.
On the one hand, books lack the concept of [hyperlinks](https://en.wikipedia.org/wiki/Hyperlink):
You cannot easily link into the text and out of it.
On the other hand, books cannot have [interactive elements](#interactive-tools),
which often make learning so much easier.
Regarding monetization, I'm not a fan of [paywalls](https://en.wikipedia.org/wiki/Paywall).
I believe that information shall be freely accessible and shareable
as long as it does [more good than harm](https://en.wikipedia.org/wiki/Information_hazard).
In my opinion, the Web is the ideal publishing platform.
But we'll see what the future holds.


### What software do you use to create the graphics? {#graphics-tool}
{:data-toc-text="Graphics tool"}

I wrote [my own SVG framework](https://github.com/KasparEtter/ef1p/tree/main/code/svg)
because I couldn't find a solution which matched my needs.
I wanted to be able to style the scalable vector graphics with the page-wide [CSS](https://en.wikipedia.org/wiki/CSS)
so that [the theme can be toggled](#dark-and-light-mode) without having to replace the graphics.
The support for [CSS classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) wasn't great
in the [vector graphics editors](https://en.wikipedia.org/wiki/Vector_graphics_editor) that I've checked.
Using code instead of a [graphical user interface (GUI)](https://en.wikipedia.org/wiki/Graphical_user_interface)
to create vector graphics has the advantage that graphics can build on one another and share common functionality.
It also makes it straightforward to [compile](https://en.wikipedia.org/wiki/Compiler) a single graphic in different ways.
I wanted the graphics to be generated ahead of time so that they can be used for other purposes as well.
All major SVG libraries, however,
manipulate a [document object model (DOM)](https://en.wikipedia.org/wiki/Document_Object_Model).
While there are workarounds to run them on a server,
such as using a [headless browser](https://en.wikipedia.org/wiki/Headless_browser)
or a [DOM library](https://github.com/jsdom/jsdom),
I decided to roll my own little SVG library, which grew over time.
It is heavily tailored to my needs and my [design language](https://en.wikipedia.org/wiki/Design_language),
but if there's enough interest, I'm open to splitting the framework into its own repository.


### Why don't you contribute to Wikipedia instead? {#wikipedia-instead}
{:data-toc-text="Wikipedia instead"}

This is a valid question, which I've asked myself in the past.
The main reasons for publishing my content on my own website are:
- **Format/structure**: Both textbooks and encyclopedias have their merit.
  For learning about a new topic, textbooks are preferable, though,
  as they provide a [learning path](https://en.wikipedia.org/wiki/Learning_pathway)
  with a point of entry and linear steps which build on one another.
  It's much easier to get lost in an encyclopedia as it lacks similar guidance.
  Since its authors cannot know where a reader is coming from, its articles often assume either too much or too little prior knowledge,
  which leads to undesirable gaps and repetitions in the learning experience.
- **Artistic freedom**: By being fully independent, I can make up better terms and concepts, which make it easier to grasp new ideas.
  A great example for this is the [security layer](/internet/#security-layer) in the [article about the Internet](/internet/),
  which makes a lot of sense, but which you won't find in the [classic literature](https://en.wikipedia.org/wiki/Internet_protocol_suite).
  Being independent also allows me to give advice and to state my opinion even on controversial topics.
- **Software stack**: By building my own publishing platform, I can implement [all ideas that I have](#navigation)
  and make my articles [interactive](#interactive-tools).
- **Hassle-free process**: I don't enjoy long discussions and interference with my work, but this fear of mine might well be misplaced.
- **Proper attribution**: Given the enormous amount of work I put into my articles, I'd like to get something out of it.
  For now, this is mostly recognition, but I'd like to make a living out of this at some point.
  You can help me get there by [supporting me financially](#donate).


### Do you accept guest content on your blog? {#guest-content}
{:data-toc-text="Guest content"}

No; even if you're willing to pay for it.
There are many open publishing platforms, such as [Medium](https://medium.com/), but this website isn't one of them.


*[CSS]: Cascading Style Sheets
*[DOM]: Document Object Model
*[FAQ]: Frequently Asked Questions
*[GDPR]: General Data Protection Regulation
*[GUI]: Graphical User Interface
*[IBAN]: International Bank Account Number
*[LLM]: Large Language Model
*[PDF]: Portable Document Format
*[PNG]: Portable Network Graphics
*[SEO]: Search Engine Optimization
*[SVG]: Scalable Vector Graphics
*[WWW]: World Wide Web
