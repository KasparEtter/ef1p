/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { bindTabbed } from '../../code/utility/tabbed';

import { CodeBlock, Comment } from '../../code/react/code';
import { injectElement, injectTool, moveElement } from '../../code/react/injection';
import { StaticPrompt } from '../../code/react/prompt';

import { Integer, MultiplicationSign, toolMathFormatting } from '../../code/math/formatting';
import { toolCosetsAdditiveGroup } from '../../code/tools/cosets/additive-group';
import { toolCosetsEllipticCurve } from '../../code/tools/cosets/elliptic-curve';
import { toolCosetsMultiplicativeGroup } from '../../code/tools/cosets/multiplicative-group';
import { dlpEllipticCurveA, dlpEllipticCurveB, dlpEllipticCurveGx, dlpEllipticCurveP, toolDiscreteLogarithmEllipticCurve } from '../../code/tools/discrete-logarithm/elliptic-curve';
import { toolDiscreteLogarithmMultiplicativeGroup, toolDiscreteLogarithmMultiplicativeGroupIndexCalculusAlgorithm } from '../../code/tools/discrete-logarithm/multiplicative-group';
import { toolEllipticCurveOperations } from '../../code/tools/elliptic-curve/operations';
import { toolGroupEllipticCurveElementOrder, toolGroupEllipticCurveGeneratorSearch } from '../../code/tools/group/elliptic-curve';
import { toolGroupMultiplicativeGroupElementOrder, toolGroupMultiplicativeGroupGeneratorSearch } from '../../code/tools/group/multiplicative-group';
import { toolIntegerChineseRemainderTheorem } from '../../code/tools/integer/chinese-remainder-theorem';
import { toolIntegerConversion } from '../../code/tools/integer/conversion';
import { toolIntegerExtendedEuclideanAlgorithm } from '../../code/tools/integer/extended-euclidean-algorithm';
import { toolIntegerFactorizationPollardsRho, toolIntegerFactorizationTrialDivision } from '../../code/tools/integer/factorization';
import { toolIntegerModularEquation } from '../../code/tools/integer/modular-equation';
import { toolIntegerModularSquareRoots } from '../../code/tools/integer/modular-square-roots';
import { toolIntegerModulo } from '../../code/tools/integer/modulo';
import { toolIntegerFermatPrimalityTest, toolIntegerMillerRabinPrimalityTest } from '../../code/tools/integer/primality-test';
import { toolIntegerPrimeNumberGeneration } from '../../code/tools/integer/prime-number-generation';
import { toolIntegerSimpleSquareRoots } from '../../code/tools/integer/simple-square-roots';
import { toolIntegerTonelliShanksAlgorithm } from '../../code/tools/integer/tonelli-shanks-algorithm';
import { toolRingOperations } from '../../code/tools/ring/operations';
import { toolTableAdditiveGroupOperation } from '../../code/tools/table/additive-group-operation';
import { toolTableAdditiveGroupRepetition } from '../../code/tools/table/additive-group-repetition';
import { toolTableEllipticCurveOperation } from '../../code/tools/table/elliptic-curve-operation';
import { toolTableEllipticCurveRepetition } from '../../code/tools/table/elliptic-curve-repetition';
import { toolTableMultiplicativeGroupOperation } from '../../code/tools/table/multiplicative-group-operation';
import { toolTableMultiplicativeGroupRepetition } from '../../code/tools/table/multiplicative-group-repetition';

bindTabbed();

// Modular arithmetic
injectTool('tool-integer-modulo', toolIntegerModulo);

// Additive groups
injectTool('tool-table-additive-group-operation', toolTableAdditiveGroupOperation);
injectTool('tool-table-additive-group-repetition', toolTableAdditiveGroupRepetition);
injectTool('tool-cosets-additive-group', toolCosetsAdditiveGroup);

// Multiplicative groups
injectTool('tool-table-multiplicative-group-operation', toolTableMultiplicativeGroupOperation);
injectTool('tool-table-multiplicative-group-repetition', toolTableMultiplicativeGroupRepetition);
injectTool('tool-cosets-multiplicative-group', toolCosetsMultiplicativeGroup);

// Prime numbers
injectTool('tool-math-formatting', toolMathFormatting);
injectTool('tool-integer-factorization-trial-division', toolIntegerFactorizationTrialDivision);
injectTool('tool-integer-extended-euclidean-algorithm', toolIntegerExtendedEuclideanAlgorithm);
injectTool('tool-integer-chinese-remainder-theorem', toolIntegerChineseRemainderTheorem);
injectTool('tool-integer-fermat-primality-test', toolIntegerFermatPrimalityTest);
injectTool('tool-integer-miller-rabin-primality-test', toolIntegerMillerRabinPrimalityTest);
injectTool('tool-integer-prime-number-generation', toolIntegerPrimeNumberGeneration);

injectTool('tool-group-multiplicative-group-element-order', toolGroupMultiplicativeGroupElementOrder);
injectTool('tool-group-elliptic-curve-element-order', toolGroupEllipticCurveElementOrder);

injectTool('tool-group-multiplicative-group-generator-search', toolGroupMultiplicativeGroupGeneratorSearch);
injectTool('tool-group-elliptic-curve-generator-search', toolGroupEllipticCurveGeneratorSearch);

// Commutative rings
injectTool('tool-ring-operations', toolRingOperations);

// Finite fields
injectTool('tool-integer-simple-square-roots', toolIntegerSimpleSquareRoots);
injectTool('tool-integer-tonelli-shanks-algorithm', toolIntegerTonelliShanksAlgorithm);
injectTool('tool-integer-modular-square-roots', toolIntegerModularSquareRoots);

// Elliptic curves
injectTool('tool-elliptic-curve-operations', toolEllipticCurveOperations);
injectTool('tool-table-elliptic-curve-operation', toolTableEllipticCurveOperation);
injectTool('tool-table-elliptic-curve-repetition', toolTableEllipticCurveRepetition);
injectTool('tool-cosets-elliptic-curve', toolCosetsEllipticCurve);
injectTool('tool-integer-conversion', toolIntegerConversion);

// DL algorithms
injectTool('tool-discrete-logarithm-multiplicative-group-binary-repetition', toolDiscreteLogarithmMultiplicativeGroup.binaryRepetition);
injectTool('tool-discrete-logarithm-elliptic-curve-binary-repetition', toolDiscreteLogarithmEllipticCurve.binaryRepetition);

injectTool('tool-discrete-logarithm-multiplicative-group-exhaustive-search', toolDiscreteLogarithmMultiplicativeGroup.exhaustiveSearch);
injectTool('tool-discrete-logarithm-elliptic-curve-exhaustive-search', toolDiscreteLogarithmEllipticCurve.exhaustiveSearch);

injectTool('tool-discrete-logarithm-multiplicative-group-baby-step-giant-step', toolDiscreteLogarithmMultiplicativeGroup.babyStepGiantStep);
injectTool('tool-discrete-logarithm-elliptic-curve-baby-step-giant-step', toolDiscreteLogarithmEllipticCurve.babyStepGiantStep);

injectTool('tool-discrete-logarithm-multiplicative-group-pollards-rho-algorithm', toolDiscreteLogarithmMultiplicativeGroup.pollardsRhoAlgorithm);
injectTool('tool-discrete-logarithm-elliptic-curve-pollards-rho-algorithm', toolDiscreteLogarithmEllipticCurve.pollardsRhoAlgorithm);

injectTool('tool-integer-modular-equation', toolIntegerModularEquation);
injectTool('tool-integer-factorization-pollards-rho', toolIntegerFactorizationPollardsRho);

injectTool('tool-discrete-logarithm-multiplicative-group-pohlig-hellman-algorithm', toolDiscreteLogarithmMultiplicativeGroup.pohligHellmanAlgorithm);
injectTool('tool-discrete-logarithm-elliptic-curve-pohlig-hellman-algorithm', toolDiscreteLogarithmEllipticCurve.pohligHellmanAlgorithm);

injectTool('tool-discrete-logarithm-multiplicative-group-index-calculus-algorithm', toolDiscreteLogarithmMultiplicativeGroupIndexCalculusAlgorithm);

injectElement('product-of-40-primes', <Fragment>
    <Integer integer={BigInt('166589903787325219380851695350896256250980509594874862046961683989710')}/>{' '}
    = 2<MultiplicationSign/>3<MultiplicationSign/>5<MultiplicationSign/>7<MultiplicationSign/>11<MultiplicationSign/>13<MultiplicationSign/>17<MultiplicationSign/>19<MultiplicationSign/>23<MultiplicationSign/>29<MultiplicationSign/>31<MultiplicationSign/>37<MultiplicationSign/>41<MultiplicationSign/>43<MultiplicationSign/>47<MultiplicationSign/>53<MultiplicationSign/>59<MultiplicationSign/>61<MultiplicationSign/>67<MultiplicationSign/>71<MultiplicationSign/>73<MultiplicationSign/>79<MultiplicationSign/>83<MultiplicationSign/>89<MultiplicationSign/>97<MultiplicationSign/>101<MultiplicationSign/>103<MultiplicationSign/>107<MultiplicationSign/>109<MultiplicationSign/>113<MultiplicationSign/>127<MultiplicationSign/>131<MultiplicationSign/>137<MultiplicationSign/>139<MultiplicationSign/>149<MultiplicationSign/>151<MultiplicationSign/>157<MultiplicationSign/>163<MultiplicationSign/>167<MultiplicationSign/>173
</Fragment>);

// Hacking around Kramdown limitations
moveElement('square-roots-modulo-power-of-2-source', 'square-roots-modulo-power-of-2-target');

injectElement('code-sagemath', <CodeBlock>
    <Comment># Determine the order of the given curve:</Comment>
    <StaticPrompt text="">EllipticCurve(Zmod({dlpEllipticCurveP}), [{dlpEllipticCurveA}, {dlpEllipticCurveB}]).cardinality()</StaticPrompt>
    <br/>
    <Comment># Determine the order of the given element:</Comment>
    <StaticPrompt text="">EllipticCurve(Zmod({dlpEllipticCurveP}), [{dlpEllipticCurveA}, {dlpEllipticCurveB}]).lift_x({dlpEllipticCurveGx}).order()</StaticPrompt>
    <br/>
    <Comment># List all the points with the given x-coordinate:</Comment>
    <StaticPrompt text="">EllipticCurve(Zmod({dlpEllipticCurveP}), [{dlpEllipticCurveA}, {dlpEllipticCurveB}]).lift_x({dlpEllipticCurveGx}, all=True)</StaticPrompt>
    <br/>
    <Comment># Plot the points of the discrete curve (only for small curves):</Comment>
    <StaticPrompt text="">EllipticCurve(Zmod({dlpEllipticCurveP}), [{dlpEllipticCurveA}, {dlpEllipticCurveB}]).plot()</StaticPrompt>
    <br/>
    <Comment># Plot the elliptic curve with the given parameters over the real numbers:</Comment>
    <StaticPrompt text="">EllipticCurve([{dlpEllipticCurveA}, {dlpEllipticCurveB}]).plot()</StaticPrompt>
</CodeBlock>);
