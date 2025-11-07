import {
  Account,
  AleoKeyProvider,
  NetworkRecordProvider,
  AleoNetworkClient,
  Program,
  ProgramManager,
  ProgramManagerBase,
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

  private async deployProgram(programName: string): Promise<Program[]> {
    const programs = loadProgramsInDeployOrder(programName);

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

      const fee = await ProgramManagerBase.estimateDeploymentFee(
        program.toString()
      );

      const txId = await this.programManager.deploy(
        program.toString(),
        Math.ceil(Number(fee) / 10 ** 6),
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
