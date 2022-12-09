---
title: Email tools
author: Kaspar Etter
license: CC BY 4.0
teaser: Play around with the tools from the article about email.
permalink: /email/tools/
---

# [Email](/email/) tools

Each title links to where the respective tool is explained.


## Lookups


### [Configuration database](/email/#configuration-database)

<div id="tool-lookup-configuration-database"></div>


### [SRV records](/email/#autoconfiguration)

<div id="tool-lookup-srv-records"></div>


### [MX records](/email/#address-resolution)

<div id="tool-lookup-mx-records"></div>


### [SPF record](/email/#sender-policy-framework)

<div id="tool-lookup-spf-record"></div>


### [DKIM record](/email/#domainkeys-identified-mail)

<div id="tool-format-dkim"></div>
<div id="tool-lookup-dkim-record" class="mt-3"></div>


### [DMARC record](/email/#domain-based-message-authentication-reporting-and-conformance)

<div id="tool-format-dmarc"></div>
<div id="tool-lookup-dmarc-record" class="mt-3"></div>


### [BIMI record](/email/#brand-indicators-for-message-identification)

<div id="tool-lookup-bimi-record"></div>


### [TLSA records](/email/#dns-based-authentication-of-named-entities)

<div id="tool-lookup-tlsa-records"></div>


### [MTA-STS policy](/email/#mail-transfer-agent-strict-transport-security)

<div id="tool-lookup-mta-sts-policy"></div>


### [TLS Reporting record](/email/#smtp-tls-reporting)

<div id="tool-lookup-tls-reporting"></div>


### [SMIMEA records](/email/#smimea-resource-record)

<div id="tool-lookup-smimea-records"></div>


### [OPENPGPKEY records](/email/#openpgpkey-resource-record)

<div id="tool-lookup-openpgpkey-records"></div>


## Protocols


### [ESMTP](/email/#esmtp-tool)

<div id="tool-protocol-esmtp"></div>

**Examples:**
- <a href="#tool-protocol-esmtp&content=text%2Fenriched&body=%3Cbold%3ERoses%3C%2Fbold%3E+%3Citalic%3Eare%3C%2Fitalic%3E%0A%3Ccolor%3E%3Cparam%3Ered%3C%2Fparam%3Ered%3C%2Fcolor%3E." title="Set the body of the ESMTP tool to a text/enriched example.">`text/enriched`</a>
- <a href="#tool-protocol-esmtp&content=text%2Fhtml&body=%3Chtml%3E%0A++%3Cbody%3E%0A++++%3Cb%3ERoses%3C%2Fb%3E+%3Ci%3Eare%3C%2Fi%3E%0A++++%3Cspan+style%3D%22color%3Ared%3B%22%3Ered%3C%2Fspan%3E.%0A++%3C%2Fbody%3E%0A%3C%2Fhtml%3E" title="Set the body of the ESMTP tool to a text/html with inline CSS example.">`text/html` with inline CSS</a>
- <a href="#tool-protocol-esmtp&content=text%2Fhtml&body=%3Chtml%3E%0A++%3Chead%3E%0A++++%3Cstyle+type%3D%22text%2Fcss%22%3E%0A++++++a+%7B+color%3A+red%3B+%7D%0A++++%3C%2Fstyle%3E%0A++%3C%2Fhead%3E%0A++%3Cbody%3E%0A++++%3Ca+href%3D%22https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FRoses_Are_Red%22%3ERoses+are+red%3C%2Fa%3E.%0A++%3C%2Fbody%3E%0A%3C%2Fhtml%3E" title="Set the body of the ESMTP tool to a text/html with internal CSS example.">`text/html` with internal CSS</a>
- <a href="#tool-protocol-esmtp&content=multipart%2Fmixed&body=--UniqueBoundary%0AContent-Type%3A+text%2Fplain%0AContent-Transfer-Encoding%3A+7bit%0A%0AThis+message+has+an+attachment.%0A%0A--UniqueBoundary%0AContent-Type%3A+image%2Fpng%0AContent-Transfer-Encoding%3A+base64%0A%0AiVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsSAAAL%0AEgHS3X78AAAB4klEQVQ4y5VVwU7CQBDdKl5IVz8Fg95ZQH%2BBhBP%2FUEAxKv%2FAN3jG%0A%2F1ATPeqlJr169WRpi%2FNmZ8uCEGqTl53OzrzO7MxOVdiKFB6s2gwDkeuEAeGRkBAW%0AgkR02KvDFj4%2BhxMCpUq5T4h1d7LU3Zulbo%2BX5GQBGToC2XzC1vML1lmtPGMiciQ5%0AI%2FxgBRmtBSFHpPS%2B0O0rRzzz%2FJWf5kxf3CKSQneusea8whGyjbIQ4kI%2BlMHHkTou%0ATpMjA5kZpoQpoUnoEeJ1UiKzdiDKmdRG2ldeAWI%2BHxvZvfIeem9wihKhO09EKWuG%0AD4KDC4WKITpJAUbnQnREugOR3%2BRjWVkgkMkR8AdtlAMQzj1C4ExIHNkh4XkbIaff%0AYlJHOAdhos3IpbCN8IDw4hHmshZeoXLpjERJG7jNfYSpd9ZloUIj52mixT8IqdId%0ArvYX4bXsxVVLlYRVUn46vryD0wPhRPSnrqVC%2BHkp7ytKwFU2w29CKK1Wk70e0seN%0A8otSpW0%2BCO9MZqIa9kSP5s85QssxqNrYLvrGxt7UXs%2FxqrGrXb2xmzqx6Jpik6IX%0AJbq%2B8i90heGQs%2BzvwXZzOFQdX%2B7ess5EmZ2Nk7%2Fja%2F%2BAHXkDdiQDduLObPeA3fEL%0AmMvYTwWJ6Hb%2BAn4Bgrjq%2Ffe5%2BzgAAAAASUVORK5CYII%3D%0A%0A--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/mixed example.">`multipart/mixed`</a>
- <a href="#tool-protocol-esmtp&content=multipart%2Fmixed&body=--UniqueBoundary%0AContent-Type%3A+text%2Fplain%3B+charset%3Dus-ascii%0A%0AHello%2C+I%27ve+attached+the+source+code+of+the+exercise.%0A%0A--UniqueBoundary%0AContent-Type%3A+text%2Fplain%3B+charset%3Dus-ascii%0AContent-Disposition%3A+attachment%3B+filename%3DHelloWorld.c%0A%0A%23include+%3Cstdio.h%3E%0A%0Aint+main%28%29+%7B%0A++printf%28%22Hello%2C+World%21%22%29%3B%0A++return+0%3B%0A%7D%0A%0A--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/mixed with content disposition example.">`multipart/mixed` with content disposition</a>
- <a href="#tool-protocol-esmtp&content=multipart%2Fmixed&body=Preamble%2C+which+is+ignored+by+MIME-supporting+clients.%0A%0A--UniqueBoundary%0A%0APart+1+with+an+implicit+content+type+of+text%2Fplain.%0A%0A--UniqueBoundary%0AContent-Type%3A+text%2Fplain%3B+charset%3Dus-ascii%0A%0APart+2+with+an+explicit+content+type+of+text%2Fplain.%0A%0A--UniqueBoundary--%0A%0AEpilogue%2C+which+is+ignored+by+MIME-supporting+clients." title="Set the body of the ESMTP tool to a multipart/mixed with preamble and epilogue example.">`multipart/mixed` with preamble and epilogue</a>
- <a href="#tool-protocol-esmtp&content=multipart%2Falternative&body=--UniqueBoundary%0AContent-Type%3A+text%2Fplain%0A%0ARoses+are+red.%0A%0A--UniqueBoundary%0AContent-Type%3A+text%2Fenriched%0A%0A%3Cbold%3ERoses%3C%2Fbold%3E+%3Citalic%3Eare%3C%2Fitalic%3E%0A%3Ccolor%3E%3Cparam%3Ered%3C%2Fparam%3Ered%3C%2Fcolor%3E.%0A%0A--UniqueBoundary%0AContent-Type%3A+text%2Fhtml%0A%0A%3Chtml%3E%0A++%3Cbody%3E%0A++++%3Cb%3ERoses%3C%2Fb%3E+%3Ci%3Eare%3C%2Fi%3E%0A++++%3Cspan+style%3D%22color%3Ared%3B%22%3Ered%3C%2Fspan%3E.%0A++%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/alternative example.">`multipart/alternative`</a>
- <a href="#tool-protocol-esmtp&content=multipart%2Frelated&body=--UniqueBoundary%0AContent-Type%3A+multipart%2Falternative%3B+boundary%3D%22InnerBoundary%22%0A%0A--InnerBoundary%0AContent-Type%3A+text%2Fplain%3B+charset%3Dus-ascii%0A%0Ahttps%3A%2F%2Fef1p.com%0A%0A--InnerBoundary%0AContent-Type%3A+text%2Fhtml%3B+charset%3Dus-ascii%0A%0A%3Chtml%3E%0A++%3Cbody%3E%0A++++%3Ca+href%3D%22https%3A%2F%2Fef1p.com%22+style%3D%22text-decoration%3A+none%3B+font-weight%3A+bold%3B+color%3A+%230D4073%3B%22%3E%0A++++++%3Cimg+src%3D%22cid%3Alogo%40ef1p.com%22+style%3D%22vertical-align%3A+middle%3B%22%3E+ef1p.com%0A++++%3C%2Fa%3E%0A++%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A--InnerBoundary--%0A%0A--UniqueBoundary%0AContent-Type%3A+image%2Fpng%0AContent-ID%3A+%3Clogo%40ef1p.com%3E%0AContent-Transfer-Encoding%3A+base64%0AContent-Disposition%3A+inline%3B+filename%3Dlogo.png%0A%0AiVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsSAAAL%0AEgHS3X78AAAB4klEQVQ4y5VVwU7CQBDdKl5IVz8Fg95ZQH%2BBhBP%2FUEAxKv%2FAN3jG%0A%2F1ATPeqlJr169WRpi%2FNmZ8uCEGqTl53OzrzO7MxOVdiKFB6s2gwDkeuEAeGRkBAW%0AgkR02KvDFj4%2BhxMCpUq5T4h1d7LU3Zulbo%2BX5GQBGToC2XzC1vML1lmtPGMiciQ5%0AI%2FxgBRmtBSFHpPS%2B0O0rRzzz%2FJWf5kxf3CKSQneusea8whGyjbIQ4kI%2BlMHHkTou%0ATpMjA5kZpoQpoUnoEeJ1UiKzdiDKmdRG2ldeAWI%2BHxvZvfIeem9wihKhO09EKWuG%0AD4KDC4WKITpJAUbnQnREugOR3%2BRjWVkgkMkR8AdtlAMQzj1C4ExIHNkh4XkbIaff%0AYlJHOAdhos3IpbCN8IDw4hHmshZeoXLpjERJG7jNfYSpd9ZloUIj52mixT8IqdId%0ArvYX4bXsxVVLlYRVUn46vryD0wPhRPSnrqVC%2BHkp7ytKwFU2w29CKK1Wk70e0seN%0A8otSpW0%2BCO9MZqIa9kSP5s85QssxqNrYLvrGxt7UXs%2FxqrGrXb2xmzqx6Jpik6IX%0AJbq%2B8i90heGQs%2BzvwXZzOFQdX%2B7ess5EmZ2Nk7%2Fja%2F%2BAHXkDdiQDduLObPeA3fEL%0AmMvYTwWJ6Hb%2BAn4Bgrjq%2Ffe5%2BzgAAAAASUVORK5CYII%3D%0A%0A--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/related with content ID example.">`multipart/related` with content ID</a>
{:.compact}


### [Email tracking](/email/#link-tracking)

<div id="tool-lookup-email-requests"></div>


### [POP3](/email/#post-office-protocol-version-3)

<div id="tool-protocol-pop3"></div>


### [IMAP](/email/#internet-message-access-protocol)

<div id="tool-protocol-imap"></div>


### [Sieve](/email/#mail-filtering-language)

<div id="tool-format-sieve"></div>


### [ManageSieve](/email/#filter-management-protocol)

<div id="tool-protocol-managesieve"></div>


## Encodings


### [Quoted-Printable encoding](/email/#content-encoding)

<div id="tool-encoding-quoted-printable"></div>


### [Base64 encoding](/email/#content-encoding)

<div id="tool-encoding-base64"></div>


### [Percent encoding](/email/#percent-encoding)

<div id="tool-encoding-percent"></div>


### [Encoded-Word encoding](/email/#header-encoding)

<div id="tool-encoding-encoded-word"></div>


### [Punycode encoding](/email/#punycode)

<div id="tool-encoding-punycode"></div>


### [Extended-Parameter encoding](/email/#internationalized-parameter-values)

<div id="tool-encoding-extended-parameter"></div>

**Examples:**
- <a href="#tool-encoding-extended-parameter&decoded=filename%3D%22%C2%A1Buenos+d%C3%ADas%21.txt%22&encoded=filename%2a%3Diso-8859-1%27es%27%25A1Buenos%2520d%25EDas%21.txt" title="Set the value of the Extended-Parameter tool to a filename example.">Filename</a>
- <a href="#tool-encoding-extended-parameter&decoded=name%3D%22Hello+world%21%22&encoded=name%2a0%3D%22Hello+%22%3B%0Aname%2a1%3Dworld%21" data-encoded="name*0=&quot;Hello &quot;;\nname*1=world!" title="Set the value of the Extended-Parameter tool to a continuation example.">Continuation</a>
- <a href="#tool-encoding-extended-parameter&decoded=name%3D%22Hello+world%21%22&encoded=name%2a1%3Dworld%21%3B%0Aname%2a0%3D%22Hello+%22" title="Set the value of the Extended-Parameter tool to an ordering example.">Ordering</a>
- <a href="#tool-encoding-extended-parameter&decoded=name%3D%22%C2%A1Buenos+d%C3%ADas%21%22&encoded=name%2a2%2a%3Dd%25EDas%21%3B%0Aname%2a0%2a%3Diso-8859-1%27es%27%25A1%3B%0Aname%2a1%3D%22Buenos+%22" title="Set the value of the Extended-Parameter tool to a combined example.">Combined</a>
{:.compact}


## Various


### [Hash function](/email/#secure-hash-algorithms)

<div id="tool-instruction-hashing"></div>


### [Unicode normalization](/email/#unicode-normalization)

<div id="tool-encoding-normalization"></div>


### [Unix time conversion](/email/#unix-time)

<div id="tool-conversion-unix-time"></div>
