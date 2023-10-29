/* 
1. install jwt
2. jwt.sing (payload, secret, {expiresIn:})
3. token client






********************HOW To Store In CLient Site********************

1. Memory ---> ok type
2. local store ---> ok type(xss)
3. cookies: http only

*/



/* 
1. set cookies with http only for development sucre: false;
2. Cors setting ->
app.use(cors({
    origin: ["http://localhost:5173/"],
    credentials: true,
}));
3. Client side axios setting
*/