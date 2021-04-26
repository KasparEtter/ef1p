import { inject } from '../../../code/react/utility';

import { toolConversionUnixTime } from '../../../code/tools/conversions/unix-time';
import { toolEncodingBase64 } from '../../../code/tools/encodings/base64';
import { toolEncodingEncodedWord } from '../../../code/tools/encodings/encoded-word';
import { bindExtendedParameters, toolEncodingExtendedParameter } from '../../../code/tools/encodings/extended-parameter';
import { toolEncodingNormalization } from '../../../code/tools/encodings/normalization';
import { toolEncodingPercent } from '../../../code/tools/encodings/percent';
import { toolEncodingPunycode } from '../../../code/tools/encodings/punycode';
import { toolEncodingQuotedPrintable } from '../../../code/tools/encodings/quoted-printable';
import { toolFormatDkim } from '../../../code/tools/formats/dkim';
import { toolFormatDmarc } from '../../../code/tools/formats/dmarc';
import { toolFormatSieve } from '../../../code/tools/formats/sieve';
import { toolInstructionHashing } from '../../../code/tools/instructions/hashing';
import { toolLookupOpenpgpkeyRecords, toolLookupSmimeaRecords } from '../../../code/tools/lookups/email-address';
import { toolLookupBimiRecord, toolLookupConfigurationDatabase, toolLookupDkimRecord, toolLookupDmarcRecord, toolLookupMtaStsPolicy, toolLookupMxRecords, toolLookupSpfRecord, toolLookupSrvRecords, toolLookupTlsaRecords, toolLookupTlsReporting } from '../../../code/tools/lookups/email-domain';
import { toolLookupEmailRequests } from '../../../code/tools/lookups/email-requests';
import { bindEsmtpExamples, toolProtocolEsmtp } from '../../../code/tools/protocols/esmtp';
import { toolProtocolImap } from '../../../code/tools/protocols/imap';
import { toolProtocolManageSieve } from '../../../code/tools/protocols/managesieve';
import { toolProtocolPop3 } from '../../../code/tools/protocols/pop3';

inject('tool-lookup-configuration-database', toolLookupConfigurationDatabase);
inject('tool-lookup-srv-records', toolLookupSrvRecords);
inject('tool-lookup-mx-records', toolLookupMxRecords);
inject('tool-lookup-spf-record', toolLookupSpfRecord);
inject('tool-format-dkim', toolFormatDkim);
inject('tool-lookup-dkim-record', toolLookupDkimRecord);
inject('tool-format-dmarc', toolFormatDmarc);
inject('tool-lookup-dmarc-record', toolLookupDmarcRecord);
inject('tool-lookup-bimi-record', toolLookupBimiRecord);
inject('tool-lookup-tlsa-records', toolLookupTlsaRecords);
inject('tool-lookup-mta-sts-policy', toolLookupMtaStsPolicy);
inject('tool-lookup-tls-reporting', toolLookupTlsReporting);
inject('tool-lookup-smimea-records', toolLookupSmimeaRecords);
inject('tool-lookup-openpgpkey-records', toolLookupOpenpgpkeyRecords);
inject('tool-lookup-email-requests', toolLookupEmailRequests);

inject('tool-protocol-esmtp', toolProtocolEsmtp);
inject('tool-protocol-pop3', toolProtocolPop3);
inject('tool-protocol-imap', toolProtocolImap);
inject('tool-format-sieve', toolFormatSieve);
inject('tool-protocol-managesieve', toolProtocolManageSieve);

inject('tool-encoding-quoted-printable', toolEncodingQuotedPrintable);
inject('tool-encoding-base64', toolEncodingBase64);
inject('tool-encoding-percent', toolEncodingPercent);
inject('tool-encoding-encoded-word', toolEncodingEncodedWord);
inject('tool-encoding-punycode', toolEncodingPunycode);
inject('tool-encoding-extended-parameter', toolEncodingExtendedParameter);

inject('tool-instruction-hashing', toolInstructionHashing);
inject('tool-encoding-normalization', toolEncodingNormalization);
inject('tool-conversion-unix-time', toolConversionUnixTime);

bindEsmtpExamples();
bindExtendedParameters();
