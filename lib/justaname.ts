import { JustaName } from "@justaname.id/sdk";

let justaname: JustaName | undefined;

export const getJustaname = () => {
  if (!justaname) {
    justaname = JustaName.init({
      dev: false,
      networks: [
        {
          chainId: 1,
          providerUrl: process.env.MAINNET_PROVIDER_URL as string,
        },
      ],
    });
  }

  return justaname;
};
