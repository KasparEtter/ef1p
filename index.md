---
layout: toc
title: Index
---

# {{ site.title }}

## Content

### Categories

{% for category in site.data.categories %}
* <i class="fas fa-{{ category.icon }}"></i>{{ category.name }}: {{ category.description }}{% endfor %}

### Articles

{% assign articles = site.pages | where_exp: "article", "article.category" | sort: "published" %}{% for article in articles %}
* {{ article.published }}: [{% if article.icon %}<i class="fas fa-{{ article.icon }}"></i>{% endif %}{{ article.title }}]({{ article.url | relative_url }}){% endfor %}

### License

<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Explained from First Principles</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://www.kasparetter.com" property="cc:attributionName" rel="cc:attributionURL">Kaspar Etter</a> is licensed under the <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

## Privacy

## Contact

## About
