import React from 'react';
import { ChapterSection, type Lesson } from './ChapterSection';

// Mock test data
const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Family',
    icon: '👨‍👩‍👧',
    status: 'completed',
    completionPercent: 100,
  },
  {
    id: '2',
    title: 'Dining',
    icon: '🍽️',
    status: 'in-progress',
    completionPercent: 60,
  },
  {
    id: '3',
    title: 'Shopping',
    icon: '🛒',
    status: 'locked',
  },
];

describe('ChapterSection Component', () => {
  it('should render chapter with title and number', () => {
    const { container } = render(
      <ChapterSection
        chapterNumber={2}
        title="Family & Friends"
        lessons={mockLessons}
      />
    );
    
    expect(container.textContent).toContain('Family & Friends');
    expect(container.textContent).toContain('2');
  });

  it('should render all lessons', () => {
    const { container } = render(
      <ChapterSection
        chapterNumber={1}
        title="Chapter 1"
        lessons={mockLessons}
      />
    );
    
    expect(container.textContent).toContain('Family');
    expect(container.textContent).toContain('Dining');
    expect(container.textContent).toContain('Shopping');
  });

  it('should handle lesson clicks when not locked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <ChapterSection
        chapterNumber={1}
        title="Chapter 1"
        lessons={mockLessons}
        onLessonClick={handleClick}
      />
    );
    
    fireEvent.click(getByText('Family'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('should display lock icon when chapter is locked', () => {
    const { container } = render(
      <ChapterSection
        chapterNumber={1}
        title="Chapter 1"
        lessons={mockLessons}
        isLocked={true}
      />
    );
    
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should display optional description', () => {
    const description = 'Learn about family relationships';
    const { container } = render(
      <ChapterSection
        chapterNumber={1}
        title="Chapter 1"
        description={description}
        lessons={mockLessons}
      />
    );
    
    expect(container.textContent).toContain(description);
  });

  it('should display completion progress bars', () => {
    const { container } = render(
      <ChapterSection
        chapterNumber={1}
        title="Chapter 1"
        lessons={mockLessons}
      />
    );
    
    // Check for progress bar indicators
    expect(container.textContent).toContain('100%');
    expect(container.textContent).toContain('60%');
  });
});
