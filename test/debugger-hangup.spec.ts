
import { Prisma, PrismaClient } from '@prisma/client';
import { expect, describe, it } from 'vitest';


describe('reproducting the debugger hangup issue from prisma, whenever your are debugging prisma related stuff - there is a risk, vscode hangs up', () => {
   it('should take long time or hang up for prisma client debug variables for prisma client', async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    // takes way to long or hangs up
    expect(prisma).toBeDefined();
    (prisma as any)[Symbol.for('nodejs.util.inspect.custom')]();
   }) 

   
   it('should take long time or hang up for prisma client debug variables in tx client', async () => {
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
    await prisma.$connect();
    const x = await prisma.$transaction(async (txClient) => {
    // takes way to long or hangs up
        (txClient as any)[Symbol.for('nodejs.util.inspect.custom')]();
        return 0;
    });
   });

   it('should take long time or hang up for prisma client debug variables in extended client', async () => {
    const extension = Prisma.defineExtension({
        client: {
            $log: (s: string) => console.log(s)
        }
    })
    const prisma = new PrismaClient().$extends(extension);
    expect(prisma).toBeDefined();
    await prisma.$connect();
    await prisma.$log("foo");

    // takes way to long or hangs up
    (prisma as any)[Symbol.for('nodejs.util.inspect.custom')]();
   });

   it('throws an error while calling inspect custom', async () => {
    const extension = Prisma.defineExtension({
        client: {
            $log: (s: string) => console.log(s)
        }
    })
    const prisma = new PrismaClient().$extends(extension);
    expect(prisma).toBeDefined();
    await prisma.$connect();
    await prisma.$log("foo");
    const x = await prisma.$transaction(async(tx) => {
    try {
        (tx as any)[Symbol.for('nodejs.util.inspect.custom')]();
    } catch(ex) {
        // here also error occured
        expect((ex as any).message).toBe("'ownKeys' on proxy: trap result did not include '$use'");        
    }
    return 0;
    });

   });
})