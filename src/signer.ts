import {
  Account,
  AleoKeyProvider,
  NetworkRecordProvider,
  AleoNetworkClient,
  Program,
  ProgramManager,
  ProgramManagerBase,
  BHP256,
  Group,
  Address,
  Plaintext,
} from "@provablehq/sdk";

import { loadProgramsInDeployOrder } from "./programs.js";

export class AleoSigner {
  private readonly aleoClient: AleoNetworkClient;

  private readonly aleoAccount: Account;
  private readonly keyProvider: AleoKeyProvider;
  private readonly networkRecordProvider: NetworkRecordProvider;
  private readonly programManager: ProgramManager;

  static connectWithSigner(
    rpcUrls: string[],
    privateKey: string,
    _extraParams?: Record<string, any>
  ): AleoSigner {
    return new AleoSigner(rpcUrls, privateKey);
  }

  protected constructor(rpcUrls: string[], privateKey: string) {
    this.aleoClient = new AleoNetworkClient(rpcUrls[0]!);

    this.aleoAccount = new Account({
      privateKey,
    });

    this.keyProvider = new AleoKeyProvider();
    this.keyProvider.useCache(true);

    this.networkRecordProvider = new NetworkRecordProvider(
      this.aleoAccount,
      this.aleoClient
    );

    this.programManager = new ProgramManager(
      rpcUrls[0],
      this.keyProvider,
      this.networkRecordProvider
    );
    this.programManager.setAccount(this.aleoAccount);
  }

  private async isProgramDeployed(program: Program) {
    try {
      await this.aleoClient.getProgram(program.id());
      return true;
    } catch {
      return false;
    }
  }

  private getProgramSlug(address: string): string {
    return new BHP256()
      .hash(Plaintext.fromString(address).toBitsLe())
      .toBytesLe()
      .reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), "")
      .slice(0, 12);
  }

  private async deployProgram(programName: string): Promise<Program[]> {
    let programs = loadProgramsInDeployOrder(programName);

    console.log("hit");
    const address = new Account().address().to_string();
    const slug = this.getProgramSlug(address);
    console.log("slug", slug);

    programs = programs.map((p) => {
      return Program.fromString(
        p
          .toString()
          .replaceAll(
            /(mailbox|dispatch_proxy|validator_announce)\.aleo/g,
            (_, p1) => `${p1}_${slug}.aleo`
          )
      );
    });

    for (const program of programs) {
      const isDeployed = await this.isProgramDeployed(program);

      // if the program is already deployed (which can be the case for some imports)
      // we simply skip it
      if (isDeployed) {
        console.log(
          `Skipping program ${program.id()} since it is already deployed`
        );
        continue;
      }

      console.log(`Deploying program ${program.id()}`);

      const txId = await this.programManager.deploy(
        program.toString(),
        0,
        false
      );

      await this.aleoClient.waitForTransactionConfirmation(txId);
    }

    return programs;
  }

  getSignerAddress(): string {
    return this.aleoAccount.address().to_string();
  }

  async createValidatorAnnounce() {
    await this.deployProgram("validator_announce");
  }

  async createMailbox() {
    await this.deployProgram("mailbox");
  }
}
