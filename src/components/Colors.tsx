import React, { useState } from 'react';
import { BsSun, BsMoonStars } from 'react-icons/bs';

interface ColorToken {
  name: string;
  var: string;
  onVar?: string;
}

interface ColorTokens {
  primary: ColorToken[];
  secondary: ColorToken[];
  tertiary: ColorToken[];
  surface: ColorToken[];
  error: ColorToken[];
}

const MaterialColorSystem = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const colorTokens: ColorTokens = {
    primary: [
      { name: 'Primary', var: '--md-primary', onVar: '--md-on-primary' },
      { name: 'Primary Container', var: '--md-primary-container', onVar: '--md-on-primary-container' },
    ],
    secondary: [
      { name: 'Secondary', var: '--md-secondary', onVar: '--md-on-secondary' },
      { name: 'Secondary Container', var: '--md-secondary-container', onVar: '--md-on-secondary-container' },
    ],
    tertiary: [
      { name: 'Tertiary', var: '--md-tertiary', onVar: '--md-on-tertiary' },
      { name: 'Tertiary Container', var: '--md-tertiary-container', onVar: '--md-on-tertiary-container' },
    ],
    surface: [
      { name: 'Surface', var: '--md-surface', onVar: '--md-on-surface' },
      { name: 'Surface Variant', var: '--md-surface-variant', onVar: '--md-on-surface-variant' },
      { name: 'Background', var: '--md-background', onVar: '--md-on-background' },
      { name: 'Outline', var: '--md-outline' },
      { name: 'Outline Variant', var: '--md-outline-variant' }
    ],
    error: [
      { name: 'Error', var: '--md-error', onVar: '--md-on-error' },
      { name: 'Error Container', var: '--md-error-container', onVar: '--md-on-error-container' },
    ]
  };

  const ColorRole = ({ name, variable, onVariable }: ColorToken) => (
    <div style={{ marginBottom: '24px' }}>
      <div 
        style={{ 
          height: '80px',
          borderRadius: '12px',
          marginBottom: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: `var(${variable})`,
          color: onVariable ? `var(${onVariable})` : 'var(--md-on-surface)'
        }}
      >
        <span style={{ fontWeight: '500' }}>{name}</span>
        <code style={{ fontSize: '14px' }}>{variable}</code>
      </div>
      {onVariable && (
        <div 
          style={{ 
            height: '48px',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: `var(${onVariable})`,
            color: `var(${variable})`
          }}
        >
          <span style={{ fontSize: '14px' }}>On {name}</span>
          <code style={{ fontSize: '14px' }}>{onVariable}</code>
        </div>
      )}
    </div>
  );

  // Example application showing practical usage
  const ExampleCard = () => (
    <div style={{
      backgroundColor: 'var(--md-surface)',
      color: 'var(--md-on-surface)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '16px'
      }}>
        <span style={{ 
          fontSize: '20px', 
          fontWeight: '500'
        }}>
          Notification Center
        </span>
      </div>

      {/* Primary notification */}
      <div style={{
        backgroundColor: 'var(--md-primary-container)',
        color: 'var(--md-on-primary-container)',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontWeight: '500' }}>New Message</div>
            <div style={{ fontSize: '14px' }}>You have 3 unread messages</div>
          </div>
          <button style={{
            backgroundColor: 'var(--md-primary)',
            color: 'var(--md-on-primary)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}>
            View
          </button>
        </div>
      </div>

      {/* Error notification */}
      <div style={{
        backgroundColor: 'var(--md-error-container)',
        color: 'var(--md-on-error-container)',
        padding: '16px',
        borderRadius: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontWeight: '500' }}>Storage Warning</div>
            <div style={{ fontSize: '14px' }}>Storage is almost full</div>
          </div>
          <button style={{
            backgroundColor: 'var(--md-error)',
            color: 'var(--md-on-error)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer'
          }}>
            Manage
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={isDarkMode ? 'dark-mode' : ''}
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--md-background)',
        color: 'var(--md-on-background)',
        padding: '24px',
        transition: 'background-color 0.2s'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header with dark mode toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '500',
            color: 'var(--md-on-background)'
          }}>
            Material Design System
          </h1>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            color: 'var(--md-on-background)'
          }}>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
              style={{ display: 'none' }}
            />
            <div style={{ 
              width: '54px',
              height: '32px',
              backgroundColor: isDarkMode ? 'var(--md-primary)' : 'var(--md-surface-variant)',
              borderRadius: '16px',
              position: 'relative',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px'
            }}>
              <BsMoonStars style={{ 
                color: isDarkMode ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
                fontSize: '16px'
              }} />
              <BsSun style={{ 
                color: isDarkMode ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
                fontSize: '16px'
              }} />
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'var(--md-surface)',
                borderRadius: '50%',
                position: 'absolute',
                top: '4px',
                left: isDarkMode ? '36px' : '4px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }} />
            </div>
          </label>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {/* Color System Display */}
          <div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              marginBottom: '16px',
              color: 'var(--md-on-background)'
            }}>
              Color System
            </h2>
            
            {Object.entries(colorTokens).map(([category, tokens]) => (
              <div key={category}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  marginTop: '16px', 
                  marginBottom: '8px',
                  textTransform: 'capitalize',
                  color: 'var(--md-on-background)'
                }}>
                  {category}
                </h3>
                {tokens.map((token) => (
                  <ColorRole 
                    key={token.var} 
                    name={token.name} 
                    variable={token.var} 
                    onVar={token.onVar} 
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Example Application */}
          <div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              marginBottom: '16px',
              color: 'var(--md-on-background)'
            }}>
              Example Application
            </h2>
            <ExampleCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialColorSystem;