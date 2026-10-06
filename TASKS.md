# Tasks — mariobros (fidelidade ao original)

Referência: disassembly em `~/vendor/smbdis/SMBDIS.ASM`. Coordenadas do jogo = coordenadas do NES
(chão em y=208). Marque `[x]` ao concluir.

## Feito
- Mastro: descida em 3 etapas (escalada com 2 frames alternando, vira para o outro lado do mastro, pula para o chão e só então anda até o castelo). Usa os frames de escalada da planilha (cells x=199/216); sprites finais são com você.
- [x] Firebars da 1-4: direções, pivô em `.5`, duplicado removido
- [x] Elevadores da 1-3: `motion="sway"` (oscila) e `motion="slide"` (horizontal) — slide vai primeiro para a DIREITA (0 → ~52px) e volta à origem, conferido no SMBDIS (`MoveWithXMCntrs`); antes estava invertido; só começa a mover quando a tela chega perto (contadores zerados no spawn, `InitVStf`); `sway` também só começa no spawn e volta ao topo no reset
- [x] Chamas antes do Bowser (`enemy-koopa-fire-spawner`, tiles 104–121)
- [x] Bowser (movimento, pulo, fogo, 5 vidas, queda), Axe, Chain, Toad, mensagem do Toad
- [x] Ponte caindo, Bowser caindo com ela, Mario anda até o Toad
- [x] Slide: Baixo no chão corta a direção; fricção do original; caixa de 16 px ao agachar
- [x] Animação de crescer/encolher + mundo congelado; flor de fogo com pisca de paleta
- [x] Bloco batendo em inimigo (vira o Goomba / casco no Koopa), 100 pts
- [x] Casco do Koopa acorda; pontuação do chute e da sequência de kills
- [x] Inimigos mortos por fogo/estrela/casco/bloco giram e caem (Goomba, Koopa, Paratroopa)
- [x] Pausa (Enter) com som; congela também as animações scriptadas (abertura da 1-2, crescer, mastro, andar até o castelo); não pausa no machado/final, morte, tally
- [x] Pontuação exata da bandeira; Mario some na porta; bandeira do castelo (0,5 s); fogos (1, 3 ou 6)
- [x] Paratroopa vermelho (voa na vertical, vira Koopa ao ser pisado)
- [x] Hitbox da Piranha Plant (e da bola de fogo contra ela) como no original
- [x] Contador de corrida (10 frames depois de soltar B)
- [x] Paredes de 1 tile: inimigos mais altos que o vão batem e voltam (`WalkingItem`)
- [x] Performance da 1-2 com vários inimigos: caixa dos colidíveis estáticos em cache + fase ampla (28 ms → 5,7 ms por tick)
- [x] Sem bola de fogo durante animações (mastro, castelo, crescer, abertura), cartão de título ou pausa
- [x] Bandeira do castelo aparecia no início da 1-3 (o `<style>` global do castelo grande sobrescrevia a posição); agora a posição é por elemento (`--flag-start`/`--flag-end`), relativa ao teto do castelo
- [x] Final das fases: a câmera trava ao tocar o mastro (`ScrollLock` do original) - some a parede azul no fim da 1-2. Conferir no jogo se a posição de parada bate com o original
- [x] Elevadores da 1-2 refeitos pelos dados do original (ids $27 descem à esquerda, $26 sobem à direita; 0,9375 px/frame; só começam ao se aproximar; o "teleporte" acontece fora da tela)
- [x] Casco do Koopa tem caixa de 16 px (passa por vão de 1 tile); só volta a levantar quando há espaço
- [x] `scriptedWalk` não escolhe teto como chão
- [x] Abertura da 1-2 vindo da 1-1: `.Scene` ficava com o scroll da fase anterior (`left: -3136px`); agora zera ao criar a cena

- [x] Modo debug via URL (`Inject.debug`, `engine/src/DebugContext.js`): `?debug` liga `<debug-background>` (mapa de referência) e `<debug-grid>` (grade 16px numerada, x esquerda→direita, y de baixo p/ cima); `?debug=overflow` também mostra o que está fora da tela e esconde o InfoBox. Flags separadas por vírgula.

## Falta — com você (sprites / conferir no original)
- [x] Sprite dos fogos de artifício (hoje: círculo CSS) — `src/castleCelebration.js`
- [x] Posição inicial do Mario: SMBDIS `PlayerStarting_X_Pos` = $28 (x=40, tile 2,5) para entrada normal; 1-1, 1-3 e 1-4 agora em `x="2.5"` (1-2 já estava)
- [x] Skid (virar correndo): só durava ~1 frame (limiar de velocidade 0.5); agora dura até parar e virar. Lado esquerdo espelhado. Dura pouco (~5 frames) porque a aceleração é 3x a original
- [x] "Rampa" do fim da ponte da 1-4: era a corrente (`Chain.js`) que prende a ponte ao machado
- [x] Sons por palpite: `fire.wav` (chama do Bowser), `billfirework.wav` (fogos)
- [x] Estrela no Bowser: conferido no SMBDIS (EColl → ShellOrBlockDefeat antes de qualquer checagem de ID; Bowser cai, 200 pts). Bola de fogo é outro caminho (5 acertos, 5000 pts)
- [x] Posição do machado (141,6) e do Toad (153,2) — conferir contra o original

## Falta — não testado
- [x] Timers da estrela (11s) e do piscar após dano (2,8s) agora congelam na pausa (`src/pausableTimeout.js`). Ainda não pausam: setTimeouts cosméticos (moeda, popup de pontos, remoção de inimigo) e a sequência da bandeira (já bloqueia pausa)
- [x] Congelamento do mundo ao pegar a flor de fogo (visual)
- [x] Soltar Baixo sob teto de 1 tile (deve continuar agachado)
- [x] Bowser morto por bolas de fogo (Goomba revelado): testado em 1-4 (5 acertos → +5000, pula e cai como Goomba de cabeça para baixo; `BowserIdentities[mundo 1] = Goomba`). Falta só você ver em vídeo se o sprite é o que queria
- [x] Mario pequeno apertando Baixo + direção correndo (desliza sem agachar)

## Ideias / não prioritário
- [ ] Fricção ao soltar o botão usa o `walkAccel` ajustado (mais seco que o original)
- [x] Soltar B com velocidade acima de 1,5: o excesso agora some pela fricção original (0,0508 / 0,0371) em vez de cortar de uma vez; no ar a velocidade é mantida
