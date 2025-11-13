import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="p-2 border rounded">Message 1</div>
          <div className="p-2 border rounded">Message 2</div>
          <div className="p-2 border rounded">Message 3</div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px] p-6">
      <p>A simple card with just content, no header or footer.</p>
    </Card>
  ),
};

export const WithList: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage your team members and their roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {['John Doe', 'Jane Smith', 'Bob Johnson'].map((name) => (
            <div key={name} className="flex items-center justify-between">
              <span>{name}</span>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add Member</Button>
      </CardFooter>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="w-[250px]">
          <CardHeader>
            <CardTitle>Card {i}</CardTitle>
            <CardDescription>Description for card {i}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content for card {i}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
