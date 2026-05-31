import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message ?? 'Unknown error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app hit an unexpected error. Tap below to try again.
        </Text>
        {__DEV__ ? (
          <Text style={styles.debug} numberOfLines={4}>
            {this.state.message}
          </Text>
        ) : null}
        <Pressable style={styles.button} onPress={this.handleRetry}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  debug: {
    marginTop: 16,
    fontSize: 12,
    color: colors.secondary,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
});
