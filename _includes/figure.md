<figure markdown="block">{% if include.scaled %}{% assign splits = include.source | split: "." %}{% assign name = splits[0] %}{% assign extension = splits[1] %}{% assign sizes = "500,1000,2000" | split: "," %}
{% capture srcset %}{% for size in sizes %}, generated/{{name}}.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset | remove_first: ", " }}" src="generated/{{name}}.{{sizes[2]}}.{{extension}}" />{% else %}
<img src="{{ include.source }}" />{% endif %}{% if include.caption %}
<figcaption markdown="span">{{ include.caption }}</figcaption>{% endif %}
</figure>
