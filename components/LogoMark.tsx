import { Image } from 'react-native';

type LogoMarkProps = {
  size?: number;
  animate?: boolean;
};

const LOGO_SOURCE = require('../assets/logo-official.png');

/** Brand logo mark — static official Gemini artwork. */
export function LogoMark({ size = 88 }: LogoMarkProps) {
  return <Image source={LOGO_SOURCE} style={{ width: size, height: size }} resizeMode="contain" />;
}
