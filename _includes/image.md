{% assign path = page.name | remove_first: ".md" | prepend: "/pages/" %}
{% assign splits = include.source | split: "." %}
{% assign name = splits[0] %}
{% assign extension = splits[1] %}
{% assign sizes = "910,1820,2730" | split: "," %}
<figure markdown="block">
<div class="mx-auto"{% if include.image-max-width %} style="max-width: {{include.image-max-width}}px;"{% endif %}>
{% if include.themed %}
    {% if extension == "jpg" %}
        {% capture srcset-light %}{% for size in sizes %}, {{path}}/generated/{{name}}.light.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}
<img srcset="{{ srcset-light | remove_first: ', ' }}" sizes="(min-width: 992px) 910px, 100vw" src="{{path}}/generated/{{name}}.light.{{sizes[2]}}.{{extension}}" class="light-theme-only" />
        {% capture srcset-dark %}{% for size in sizes %}, {{path}}/generated/{{name}}.dark.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}
<img srcset="{{ srcset-dark | remove_first: ', ' }}" sizes="(min-width: 992px) 910px, 100vw" src="{{path}}/generated/{{name}}.dark.{{sizes[2]}}.{{extension}}" class="dark-theme-only" />
    {% else %}
<img src="{{path}}/generated/{{name}}.light.{{extension}}" class="light-theme-only" />
<img src="{{path}}/generated/{{name}}.dark.{{extension}}" class="dark-theme-only" />
    {% endif %}
{% else %}
    {% if extension == "jpg" %}
        {% capture srcset %}{% for size in sizes %}, {{path}}/generated/{{name}}.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}
<img srcset="{{ srcset | remove_first: ', ' }}" sizes="(min-width: 992px) 910px, 100vw" src="{{path}}/generated/{{name}}.{{sizes[2]}}.{{extension}}" />
    {% else %}
<img src="{{path}}/generated/{{ include.source }}" />
    {% endif %}
{% endif %}
</div>
{% if include.caption %}
<figcaption markdown="span"{% if include.caption-max-width %} style="max-width: {{include.caption-max-width}}px;"{% endif %}>{{ include.caption }}</figcaption>
{% endif %}
</figure>
