declare module 'react-native-url-preview' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

  export interface RNUrlPreviewProps {
    text: string;
    containerStyle?: ViewStyle | ViewStyle[];
    imageStyle?: ImageStyle | ImageStyle[];
    faviconStyle?: ImageStyle | ImageStyle[];
    titleStyle?: TextStyle | TextStyle[];
    descriptionStyle?: TextStyle | TextStyle[];
    titleNumberOfLines?: number;
    descriptionNumberOfLines?: number;
    imageProps?: any;
    onPress?: (info: any) => void;
  }

  const RNUrlPreview: ComponentType<RNUrlPreviewProps>;
  export default RNUrlPreview;
}