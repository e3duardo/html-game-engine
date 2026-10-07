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
- Replay de um playthrough gravado chega na bandeira da 1-1 no nosso jogo, com o estado interno batendo byte a byte com o log de referência até o frame 4349 (relógio virtual, 1 tick do engine por frame gravado, ~10s por rodada). Para isso o Mario passou a usar física inteira (`intPhysics` em `engine/src/Puppet.js`, opt-in; o marioworld não muda):
  - horizontal: atrito e movimento com dois bytes de força separados, direção de movimento começando em 0, checagem de derrapada depois do cálculo do atrito, bits de colisão mascarando o atrito, timer de corrida;
  - vertical: gravidade com bytes de velocidade/força/dummy, escolha da gravidade do pulo/queda (state 0/1/2), pulo por faixa de velocidade, bounce do stomp = -4 (goomba/koopa);
  - colisão por tiles: cabeça em Y+4 (grande) ou +18 (pequeno), pés em X+3/X+12 (4px de tolerância para pousar), laterais em X+2/X+13 empurrando 1px por frame, pés fundos pulam a checagem lateral;
  - caixas de colisão: Mario 10x12 / 12x24, goomba 10x6, itens e koopa andando 12x12, casco 10x6;
  - contato com inimigos só em frames pares do contador de frames, uma vez por contato (bit de colisão), inimigo anda antes de testar o contato; stomp = velocidade vertical > 0;
  - câmera com o atraso entre x 80 e 112, grupos de goombas nascendo na borda direita (atributos `group`/`lead` no 1-1), cogumelo/flor subindo 1px a cada 4 frames e saindo na hora do hit, freeze do power-up de 59/63 frames começando no frame seguinte (dano: 55 frames, Mario livre depois dos 16 primeiros), aceleração 0.0371/0.0557, clock do HUD de 24 frames.
- [ ] Depois da bandeira o replay diverge (o engine entra na sequência própria de fim de fase; a referência continua em estado diferente): conferir a sequência do mastro/castelo contra o log de referência.
- [ ] Outras fases com a física nova: elevadores/plataformas da 1-2/1-3/1-4 foram só testados na mão (ficam presos ao Mario, sem tremer). Vale gravar um playthrough de cada fase para repetir a comparação (precisa de um `inputs.csv` por fase).
- [ ] Grupos de inimigos das outras fases: só a 1-1 tem os atributos `group`/`lead` (nascimento na borda direita da tela).
- [ ] Enemies ainda usam a física antiga (float) - só o Mario é exato; koopas/paratroopas/Bowser/plantas fora da 1-1 não foram comparados com o log de referência.
- [ ] `hitBox()` hoje vem de insets no código (Mario, goomba, itens, koopa); a ideia da `div .c` (offset/tamanho no markup, ao lado de `.g`/`.m`) já é lida por `Collidable.hitBox()` quando existir, falta migrar os componentes.
