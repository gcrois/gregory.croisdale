import React, { useEffect } from 'react';
import type { CollectionEntry } from 'astro:content';
import { FaSort } from 'react-icons/fa';

interface BlogSorterProps {
  posts: CollectionEntry<'blog'>[];
}

const BlogSorter: React.FC<BlogSorterProps> = ({ posts }) => {
  useEffect(() => {
    const sortOrderSelect = document.getElementById('sortOrder') as HTMLSelectElement;
    const tagFiltersContainer = document.getElementById('tag-filters') as HTMLDivElement;

    if (!sortOrderSelect || !tagFiltersContainer) return;

    // Extract all tags and counts from posts
    const tagCounts: Record<string, number> = {};

    posts.forEach((post) => {
      post.data.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const allTags = Object.keys(tagCounts);

    // Create tag filter checkboxes with counts
    tagFiltersContainer.innerHTML = '';
    allTags.forEach((tag) => {
      const div = document.createElement('div');
      div.className = 'filter-item';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = tag;
      input.id = `tag-${tag}`;
      input.className = 'filter-checkbox';

      const label = document.createElement('label');
      label.htmlFor = `tag-${tag}`;
      label.className = 'tag';
      label.textContent = `${tag} (${tagCounts[tag]})`;

      div.appendChild(input);
      div.appendChild(label);
      tagFiltersContainer.appendChild(div);

      input.addEventListener('change', applyFilters);
    });

    sortOrderSelect.addEventListener('change', applyFilters);

    function applyFilters() {
      const sortOrder = sortOrderSelect.value as 'asc' | 'desc';
      const selectedTags = Array.from(
        tagFiltersContainer.querySelectorAll('input[type="checkbox"]:checked')
      ).map((input) => (input as HTMLInputElement).value);

      const filteredPosts = posts.filter((post) => {
        return selectedTags.length === 0 || selectedTags.every((tag) => post.data.tags.includes(tag));
      });

      filteredPosts.sort((a, b) => {
        const dateA = new Date(a.data.date).getTime();
        const dateB = new Date(b.data.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      // Hide all posts first
      posts.forEach((post) => {
        const el = document.getElementById(`post-${encodeURIComponent(post.slug)}`);
        if (el) {
          el.style.display = 'none';
        }
      });

      // Update order and display
      filteredPosts.forEach((post, index) => {
        const el = document.getElementById(`post-${encodeURIComponent(post.slug)}`);
        if (el) {
          el.style.order = index.toString();
          el.style.display = 'block';
        }
      });

      updateTagCounts(filteredPosts);
    }

    function updateTagCounts(filteredPosts: CollectionEntry<'blog'>[]) {
      const filteredTagCounts: Record<string, number> = {};

      filteredPosts.forEach((post) => {
        post.data.tags.forEach((tag) => {
          filteredTagCounts[tag] = (filteredTagCounts[tag] || 0) + 1;
        });
      });

      allTags.forEach((tag) => {
        const label = tagFiltersContainer.querySelector(`label[for="tag-${tag}"]`);
        if (label) {
          label.textContent = `${tag} (${filteredTagCounts[tag] || 0})`;
        }
      });
    }

    applyFilters();
  }, [posts]);

  return (
    <div className="filter-container">
      <div className="sort-section">
        <label htmlFor="sortOrder" className="sort-label">
          <FaSort className="sort-icon" />
          Sort by date:
        </label>
        <select id="sortOrder" className="sort-select">
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Filter by tags:</label>
        <div id="tag-filters" className="tag-filters" />
      </div>
    </div>
  );
};

export default BlogSorter;