module task4::my_game{
    // >>>>>>>>>> Start Imports <<<<<<<<<<
    use task2::boji_coin_faucet::BOJI_COIN_FAUCET;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::random::{Self, Random};
    use sui::transfer::{share_object, public_transfer, transfer};
    // >>>>>>>>>> End Imports <<<<<<<<<<

    // >>>>>>>>>> Start Errors handling <<<<<<<<<<
    const EExceedBalance: u64 = 0x0;
    // >>>>>>>>>> End Errors handling <<<<<<<<<<

    // >>>>>>>>>> Start Structs <<<<<<<<<<
    public struct Boji_Game has key {
        id: UID,
        val: Balance<BOJI_COIN_FAUCET>,
    }

    public struct AdminCap has key {
        id: UID,
    }
    // >>>>>>>>>> End Structs <<<<<<<<<<

    // >>>>>>>>>> Start INIT Functions <<<<<<<<<<
    fun init(ctx: &mut TxContext) {
        let game = Boji_Game {
            id: object::new(ctx),
            val: balance::zero(),
        };
        share_object(game);

        let admin = AdminCap {
            id: object::new(ctx),
        };

        transfer(admin, ctx.sender());
    }
    // >>>>>>>>>> End INIT Functions <<<<<<<<<<

    // >>>>>>>>>> Start Public Functions <<<<<<<<<<
    public entry fun DepositCoin(game: &mut Boji_Game, coin: Coin<BOJI_COIN_FAUCET>,_ctx:&mut TxContext) {
        game.val.join(coin::into_balance(coin));
    }

    public entry fun WithdrawCoin(_: &AdminCap, game: &mut Boji_Game, value: u64, ctx: &mut TxContext) {
        let out_balance = game.val.split(value);
        let out_coin = coin::from_balance(out_balance, ctx);
        public_transfer(out_coin, ctx.sender());
    }

    entry fun play(
        game: &mut Boji_Game,
        rnd: &Random,
        guess: bool,
        in_coin: Coin<BOJI_COIN_FAUCET>,
        ctx: &mut TxContext
    ) {
        let mut gen = random::new_generator(rnd, ctx);
        let flip_value = random::generate_bool(&mut gen);
        let val_value = in_coin.value();
        let game_val = game.val.value();
        assert!(game_val >= val_value * 10, EExceedBalance);
        if (guess == flip_value) {
            let out_balance = game.val.split(val_value);
            let out_coin = coin::from_balance(out_balance, ctx);
            public_transfer(out_coin, ctx.sender());
            public_transfer(in_coin, ctx.sender());
        }else {
            DepositCoin(game,in_coin,ctx);
        }
    }
    // >>>>>>>>>> End Public Functions <<<<<<<<<<
}