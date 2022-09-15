/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { injectTool } from '../../../code/react/injection';

import { toolConversionUnixTime } from '../../../code/tools/conversion/unix-time';
import { toolEncodingBase64 } from '../../../code/tools/encoding/base64';
import { toolEncodingEncodedWord } from '../../../code/tools/encoding/encoded-word';
import { toolEncodingExtendedParameter } from '../../../code/tools/encoding/extended-parameter';
import { toolEncodingNormalization } from '../../../code/tools/encoding/normalization';
import { toolEncodingPercent } from '../../../code/tools/encoding/percent';
import { toolEncodingPunycode } from '../../../code/tools/encoding/punycode';
import { toolEncodingQuotedPrintable } from '../../../code/tools/encoding/quoted-printable';
import { toolFormatDkim } from '../../../code/tools/format/dkim';
import { toolFormatDmarc } from '../../../code/tools/format/dmarc';
import { toolFormatSieve } from '../../../code/tools/format/sieve';
import { toolInstructionHashing } from '../../../code/tools/instruction/hashing';
import { toolLookupOpenpgpkeyRecords, toolLookupSmimeaRecords } from '../../../code/tools/lookup/email-address';
import { toolLookupBimiRecord, toolLookupConfigurationDatabase, toolLookupDkimRecord, toolLookupDmarcRecord, toolLookupMtaStsPolicy, toolLookupMxRecords, toolLookupSpfRecord, toolLookupSrvRecords, toolLookupTlsaRecords, toolLookupTlsReporting } from '../../../code/tools/lookup/email-domain';
import { toolLookupEmailRequests } from '../../../code/tools/lookup/email-requests';
import { toolProtocolEsmtp } from '../../../code/tools/protocol/esmtp';
import { toolProtocolImap } from '../../../code/tools/protocol/imap';
import { toolProtocolManageSieve } from '../../../code/tools/protocol/managesieve';
import { toolProtocolPop3 } from '../../../code/tools/protocol/pop3';

injectTool('tool-lookup-configuration-database', toolLookupConfigurationDatabase);
injectTool('tool-lookup-srv-records', toolLookupSrvRecords);
injectTool('tool-lookup-mx-records', toolLookupMxRecords);
injectTool('tool-lookup-spf-record', toolLookupSpfRecord);
injectTool('tool-format-dkim', toolFormatDkim);
injectTool('tool-lookup-dkim-record', toolLookupDkimRecord);
injectTool('tool-format-dmarc', toolFormatDmarc);
injectTool('tool-lookup-dmarc-record', toolLookupDmarcRecord);
injectTool('tool-lookup-bimi-record', toolLookupBimiRecord);
injectTool('tool-lookup-tlsa-records', toolLookupTlsaRecords);
injectTool('tool-lookup-mta-sts-policy', toolLookupMtaStsPolicy);
injectTool('tool-lookup-tls-reporting', toolLookupTlsReporting);
injectTool('tool-lookup-smimea-records', toolLookupSmimeaRecords);
injectTool('tool-lookup-openpgpkey-records', toolLookupOpenpgpkeyRecords);
injectTool('tool-lookup-email-requests', toolLookupEmailRequests);

injectTool('tool-protocol-esmtp', toolProtocolEsmtp);
injectTool('tool-protocol-pop3', toolProtocolPop3);
injectTool('tool-protocol-imap', toolProtocolImap);
injectTool('tool-format-sieve', toolFormatSieve);
injectTool('tool-protocol-managesieve', toolProtocolManageSieve);

injectTool('tool-encoding-quoted-printable', toolEncodingQuotedPrintable);
injectTool('tool-encoding-base64', toolEncodingBase64);
injectTool('tool-encoding-percent', toolEncodingPercent);
injectTool('tool-encoding-encoded-word', toolEncodingEncodedWord);
injectTool('tool-encoding-punycode', toolEncodingPunycode);
injectTool('tool-encoding-extended-parameter', toolEncodingExtendedParameter);

injectTool('tool-instruction-hashing', toolInstructionHashing);
injectTool('tool-encoding-normalization', toolEncodingNormalization);
injectTool('tool-conversion-unix-time', toolConversionUnixTime);
