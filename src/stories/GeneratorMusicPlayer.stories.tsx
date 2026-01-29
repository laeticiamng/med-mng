import type { Meta, StoryObj } from '@storybook/react';
import { GeneratorMusicPlayer } from '@/components/music/GeneratorMusicPlayer';

const meta: Meta<typeof GeneratorMusicPlayer> = {
  title: 'Music/GeneratorMusicPlayer',
  component: GeneratorMusicPlayer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Lecteur musical avec contrôles avancés pour la génération et lecture de musique IA.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    song: {
      control: 'object',
      description: 'Objet chanson avec métadonnées',
    },
    isPlaying: {
      control: 'boolean',
      description: 'État de lecture en cours',
    },
    onPlayPause: {
      action: 'play-pause',
      description: 'Callback play/pause',
    },
    onNext: {
      action: 'next',
      description: 'Callback chanson suivante',
    },
    onPrevious: {
      action: 'previous',  
      description: 'Callback chanson précédente',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockSong = {
  id: '1',
  title: 'Morceau de Test',
  artist: 'IA Composer',
  duration: 180,
  url: 'https://example.com/audio.mp3',
  imageUrl: 'https://example.com/cover.jpg',
  genre: 'Ambient',
  bpm: 120,
};

export const Default: Story = {
  args: {
    song: mockSong,
    isPlaying: false,
  },
};

export const Playing: Story = {
  args: {
    song: mockSong,
    isPlaying: true,
  },
};

export const LongTitle: Story = {
  args: {
    song: {
      ...mockSong,
      title: 'Titre très long qui pourrait déborder du conteneur et causer des problèmes de mise en page',
      artist: 'Artiste avec un nom également très long',
    },
    isPlaying: false,
  },
};

export const NoImage: Story = {
  args: {
    song: {
      ...mockSong,
      imageUrl: undefined,
    },
    isPlaying: false,
  },
};